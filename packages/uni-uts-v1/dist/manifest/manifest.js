"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveManifestJson = exports.isCustomResources = exports.hasCustomResources = exports.checkManifest = exports.resolvePluginFiles = exports.genManifestJson = exports.genManifestFile = exports.hash = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const md5_file_1 = __importDefault(require("md5-file"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const fileCaches = new Map();
const VERSION = '1';
/**
 * 计算文件 md5（有缓存）
 * @param file
 * @returns
 */
async function hash(file) {
    const cache = fileCaches.get(file);
    const stat = (0, fs_extra_1.statSync)(file);
    if (cache && cache.mtimeMs === stat.mtimeMs) {
        return cache.md5;
    }
    return (0, md5_file_1.default)(file).then((value) => {
        fileCaches.set(file, { mtimeMs: stat.mtimeMs, md5: value });
        return value;
    });
}
exports.hash = hash;
async function genManifestFile(platform, { files, pluginDir, env, cacheDir, pluginRelativeDir, is_uni_modules, }) {
    (0, fs_extra_1.outputFileSync)(resolveManifestFilename(platform, pluginRelativeDir, cacheDir), JSON.stringify(await genManifestJson(platform, {
        pluginDir,
        files,
        env,
        is_uni_modules,
    }), null, 2));
    return true;
}
exports.genManifestFile = genManifestFile;
async function genManifestJson(platform, { pluginDir, files, env, is_uni_modules }) {
    if (!files) {
        files = await resolvePluginFiles(platform, pluginDir, is_uni_modules);
    }
    if (!files) {
        files = [];
    }
    return {
        version: VERSION,
        env,
        files: await genManifestFiles(pluginDir, files),
    };
}
exports.genManifestJson = genManifestJson;
async function genManifestFiles(dir, files) {
    const manifestFiles = {};
    // 优先 uts 文件
    files = files.sort((a, b) => {
        const aUts = a.endsWith('.uts');
        const bUts = b.endsWith('.uts');
        if (aUts && bUts) {
            return a > b ? 1 : -1;
        }
        if (aUts) {
            return -1;
        }
        return 1;
    });
    const md5Arr = await Promise.all(files.map((file) => hash((0, path_1.join)(dir, file))));
    files.forEach((name, index) => {
        manifestFiles[name] = {
            md5: md5Arr[index],
        };
    });
    return manifestFiles;
}
async function resolvePluginCommonFiles(pluginDir, is_uni_modules) {
    const patterns = ['*'];
    if (is_uni_modules) {
        patterns.push('utssdk/*.uts');
        patterns.push('utssdk/common/**/*');
    }
    else {
        patterns.push('common/**/*');
    }
    return (0, fast_glob_1.default)(patterns, {
        ignore: ['changelog.md', 'readme.md'],
        cwd: pluginDir,
    });
}
async function resolvePluginFiles(platform, pluginDir, is_uni_modules) {
    return Promise.all([
        resolvePluginCommonFiles(pluginDir, is_uni_modules),
        resolvePluginPlatformFiles(platform, pluginDir, is_uni_modules),
    ]).then((files) => files.flat());
}
exports.resolvePluginFiles = resolvePluginFiles;
async function resolvePluginPlatformFiles(platform, pluginDir, is_uni_modules) {
    return (0, fast_glob_1.default)((is_uni_modules ? 'utssdk/' : '') + platform + '/**/*', {
        cwd: pluginDir,
    });
}
async function checkManifest(manifest, { env, files, pluginDir, }) {
    if (manifest.version !== VERSION) {
        return false;
    }
    if (isEnvExpired(manifest.env, env)) {
        return false;
    }
    return checkFiles(manifest.files, files, pluginDir);
}
exports.checkManifest = checkManifest;
/**
 * 判断 env 是否过期
 * @param value
 * @param other
 * @returns
 */
function isEnvExpired(value, other) {
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);
    if (valueKeys.length !== otherKeys.length) {
        return true;
    }
    if (valueKeys.find((name) => value[name] !== other[name])) {
        return true;
    }
    return false;
}
/**
 * 判断文件列表是否过期
 * @param files
 * @param filenames
 * @returns
 */
async function checkFiles(files, filenames, pluginDir) {
    const oldFilenames = Object.keys(files);
    // 第一步：优先判断文件列表长度
    if (oldFilenames.length !== filenames.length) {
        return false;
    }
    // 第二步：判断文件列表
    if (oldFilenames.find((name) => !filenames.includes(name))) {
        return false;
    }
    // 第三步：判断文件 md5
    for (const name of oldFilenames) {
        const md5 = await hash((0, path_1.join)(pluginDir, name));
        if (files[name].md5 !== md5) {
            return name;
        }
    }
    return true;
}
function hasCustomResources(files, resources) {
    if (files.some((file) => isCustomResources(file, resources))) {
        return true;
    }
}
exports.hasCustomResources = hasCustomResources;
function isCustomResources(file, resources) {
    return resources.some((res) => file.includes(res));
}
exports.isCustomResources = isCustomResources;
function resolveManifestFilename(platform, pluginRelativeDir, cacheDir) {
    return (0, path_1.join)(cacheDir, platform, 'uts', pluginRelativeDir, 'manifest.json');
}
function resolveManifestJson(platform, pluginRelativeDir, cacheDir) {
    const file = resolveManifestFilename(platform, pluginRelativeDir, cacheDir);
    if ((0, fs_extra_1.existsSync)(file)) {
        try {
            return JSON.parse((0, fs_extra_1.readFileSync)(file, 'utf8'));
        }
        catch (e) { }
    }
}
exports.resolveManifestJson = resolveManifestJson;
