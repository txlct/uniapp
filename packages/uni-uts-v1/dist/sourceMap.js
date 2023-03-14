"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.originalPositionFor = exports.generatedPositionFor = exports.resolveUtsPluginSourceMapFile = exports.resolveUTSPluginSourceMapFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const source_map_1 = require("source-map");
const EXTNAME = {
    kotlin: '.kt',
    swift: '.swift',
};
const PLATFORM_DIR = {
    kotlin: 'app-android',
    swift: 'app-ios',
};
function resolveUTSPluginSourceMapFile(target, filename, inputDir, outputDir) {
    inputDir = normalizePath(inputDir);
    outputDir = normalizePath(outputDir);
    filename = normalizePath(filename);
    const pluginDir = resolvePluginDir(inputDir, outputDir, filename);
    if (!pluginDir) {
        throw `plugin dir not found`;
    }
    const is_uni_modules = (0, path_1.basename)((0, path_1.dirname)(pluginDir)) === 'uni_modules';
    const sourceMapFile = (0, path_1.join)((0, path_1.join)(outputDir, '../.sourcemap/app'), (0, path_1.relative)(inputDir, pluginDir), is_uni_modules ? 'utssdk' : '', PLATFORM_DIR[target], `index${EXTNAME[target]}.map`);
    if (!(0, fs_1.existsSync)(sourceMapFile)) {
        throw `${sourceMapFile} not found`;
    }
    return sourceMapFile;
}
exports.resolveUTSPluginSourceMapFile = resolveUTSPluginSourceMapFile;
// 兼容旧版本
exports.resolveUtsPluginSourceMapFile = resolveUTSPluginSourceMapFile;
function resolvePluginDir(inputDir, outputDir, filename) {
    // 目标文件是编译后 kt 或 swift
    if (filename.startsWith(outputDir)) {
        const relativePath = (0, path_1.relative)(outputDir, filename);
        const hasSrc = normalizePath(relativePath).includes('/src/');
        // uni_modules/test-uts
        if (relativePath.startsWith('uni_modules')) {
            return (0, path_1.join)(inputDir, (0, path_1.join)(relativePath, hasSrc ? '../../../..' : '../../..'));
        }
        // utssdk/test-uts
        return (0, path_1.join)(inputDir, (0, path_1.join)(relativePath, hasSrc ? '../../..' : '../..'));
    }
    else if (filename.startsWith(inputDir)) {
        let parent = (0, path_1.dirname)(filename);
        const utssdkDir = normalizePath((0, path_1.join)(inputDir, 'utssdk'));
        const uniModulesDir = normalizePath((0, path_1.join)(inputDir, 'uni_modules'));
        while (parent) {
            const dir = (0, path_1.dirname)(parent);
            if (parent === dir) {
                // windows 上边会剩下一个盘符
                return;
            }
            if (dir === utssdkDir || dir === uniModulesDir) {
                return parent;
            }
            parent = dir;
        }
        throw `${filename} is not a uts plugin file`;
    }
    else {
        throw `${filename} is not in ${inputDir} or ${outputDir}`;
    }
}
const consumers = {};
/**
 * 解析源码文件，目前 uts 的 sourcemap 存储的都是相对目录
 * @param consumer
 * @param filename
 * @returns
 */
function resolveSource(consumer, filename) {
    filename = normalizePath(filename);
    return (consumer.sources.find((source) => filename.endsWith(source)) || filename);
}
/**
 * 根据源码文件名、行号、列号，返回生成后文件、行号、列号（根据 uts 文件返回 kt|swift 文件）
 * @param originalPosition
 * @returns
 */
function generatedPositionFor({ sourceMapFile, filename, line, column, outputDir, }) {
    return resolveSourceMapConsumer(sourceMapFile).then((consumer) => {
        const res = consumer.generatedPositionFor({
            source: resolveSource(consumer, filename),
            line,
            column,
            bias: column === 0 ? 2 /* BIAS.LEAST_UPPER_BOUND */ : 1 /* BIAS.GREATEST_LOWER_BOUND */,
        });
        let source = null;
        if (outputDir) {
            // 根据 sourceMapFile 和 outputDir，计算出生成后的文件路径
            source = (0, path_1.join)(outputDir, (0, path_1.relative)((0, path_1.join)(outputDir, '../.sourcemap/app'), sourceMapFile)).replace('.map', '');
        }
        return Object.assign(res, { source });
    });
}
exports.generatedPositionFor = generatedPositionFor;
/**
 * 根据生成后的文件名、行号、列号，返回源码文件、行号、列号（根据 kt|swift 文件返回 uts 文件）
 * @param generatedPosition
 * @returns
 */
function originalPositionFor(generatedPosition) {
    return resolveSourceMapConsumer(generatedPosition.sourceMapFile).then((consumer) => {
        const res = consumer.originalPositionFor({
            line: generatedPosition.line,
            column: generatedPosition.column,
            bias: generatedPosition.column === 0
                ? 2 /* BIAS.LEAST_UPPER_BOUND */
                : 1 /* BIAS.GREATEST_LOWER_BOUND */,
        });
        if (generatedPosition.withSourceContent &&
            res.source &&
            res.line &&
            res.column) {
            return Object.assign(res, {
                sourceContent: consumer.sourceContentFor(res.source, true),
            });
        }
        if (res.source && generatedPosition.inputDir) {
            res.source = (0, path_1.join)(generatedPosition.inputDir, res.source);
        }
        return res;
    });
}
exports.originalPositionFor = originalPositionFor;
async function resolveSourceMapConsumer(sourceMapFile) {
    const stats = (0, fs_1.statSync)(sourceMapFile);
    if (!stats.isFile()) {
        throw `${sourceMapFile} is not a file`;
    }
    const cache = consumers[sourceMapFile];
    if (!cache || cache.time !== stats.mtimeMs) {
        consumers[sourceMapFile] = {
            time: stats.mtimeMs,
            consumer: await new source_map_1.SourceMapConsumer((0, fs_1.readFileSync)(sourceMapFile, 'utf8')),
        };
    }
    return consumers[sourceMapFile].consumer;
}
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
