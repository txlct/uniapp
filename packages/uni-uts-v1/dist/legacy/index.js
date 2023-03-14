"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeFrameWithSwiftStacktrace = exports.generateCodeFrameWithKotlinStacktrace = exports.generateCodeFrameWithSourceMapPath = exports.generateCodeFrameSourceMapConsumer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const source_map_1 = require("source-map");
const stacktrace_1 = require("../stacktrace");
function generateCodeFrameSourceMapConsumer(consumer, m, options = {}) {
    if (m.file) {
        const res = consumer.originalPositionFor({
            line: m.line,
            column: m.column,
        });
        if (res.source != null && res.line != null && res.column != null) {
            let code = consumer.sourceContentFor(res.source, true);
            if (code) {
                code = (0, stacktrace_1.generateCodeFrame)(code, { line: res.line, column: res.column });
                if (options.replaceTabsWithSpace) {
                    code = code.replace(/\t/g, ' ');
                }
                return {
                    type: m.type,
                    file: res.source,
                    line: res.line,
                    column: res.column,
                    message: m.message,
                    code,
                };
            }
        }
    }
}
exports.generateCodeFrameSourceMapConsumer = generateCodeFrameSourceMapConsumer;
function initConsumer(filename) {
    if (fs_1.default.existsSync(filename)) {
        return new source_map_1.SourceMapConsumer(fs_1.default.readFileSync(filename, 'utf8'));
    }
    return Promise.resolve(undefined);
}
function generateCodeFrameWithSourceMapPath(filename, messages, options = {}) {
    if (typeof messages === 'string') {
        try {
            messages = JSON.parse(messages);
        }
        catch (e) { }
    }
    if (Array.isArray(messages) && messages.length) {
        return new Promise((resolve) => {
            initConsumer(filename).then((consumer) => {
                resolve(messages
                    .map((m) => {
                    if (m.file && consumer) {
                        const message = generateCodeFrameSourceMapConsumer(consumer, m, options);
                        if (message) {
                            return message;
                        }
                    }
                    if (!m.file) {
                        m.file = '';
                    }
                    return m;
                })
                    .filter(Boolean));
            });
        });
    }
    return Promise.resolve([]);
}
exports.generateCodeFrameWithSourceMapPath = generateCodeFrameWithSourceMapPath;
function resolveSourceMapPath(sourceMapFilename, name, outputDir) {
    const is_uni_modules = path_1.default.basename(path_1.default.dirname(name)) === 'uni_modules';
    return path_1.default.resolve(outputDir, '../.sourcemap/app', name, is_uni_modules ? 'utssdk' : '', sourceMapFilename);
}
function generateCodeFrameWithKotlinStacktrace(stacktrace, { name, inputDir, outputDir }) {
    const sourceMapFilename = resolveSourceMapPath('app-android/index.kt.map', name, outputDir);
    return generateCodeFrameWithStacktrace(stacktrace, /e:\s+(.*):\s+\(([0-9]+),\s+([0-9]+)\):\s+(.*)/g, {
        sourceRoot: inputDir,
        sourceMapFilename,
    });
}
exports.generateCodeFrameWithKotlinStacktrace = generateCodeFrameWithKotlinStacktrace;
function generateCodeFrameWithSwiftStacktrace(stacktrace, { name, inputDir, outputDir }) {
    const sourceMapFilename = resolveSourceMapPath('app-ios/index.swift.map', name, outputDir);
    return generateCodeFrameWithStacktrace(stacktrace, /(.*):([0-9]+):([0-9]+):\s+error:\s+(.*)/g, {
        sourceRoot: inputDir,
        sourceMapFilename,
    });
}
exports.generateCodeFrameWithSwiftStacktrace = generateCodeFrameWithSwiftStacktrace;
function generateCodeFrameWithStacktrace(stacktrace, regexp, { sourceRoot, sourceMapFilename, replaceTabsWithSpace, }) {
    return new Promise((resolve) => {
        initConsumer(sourceMapFilename).then((consumer) => {
            if (!consumer) {
                return resolve(stacktrace);
            }
            resolve(stacktrace.replace(regexp, (substring, file, line, column, message) => {
                const m = generateCodeFrameSourceMapConsumer(consumer, {
                    type: 'error',
                    file,
                    message,
                    line: parseInt(line),
                    column: parseInt(column),
                }, { sourceRoot, replaceTabsWithSpace });
                if (!m) {
                    return substring;
                }
                return `error: ${message}
at ${m.file}:${m.line}:${m.column}
${m.code}
`;
            }));
        });
    });
}
