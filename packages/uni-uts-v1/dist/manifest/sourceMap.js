"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSourceMapCacheFilename = exports.resolveSourceMapFilename = exports.restoreSourceMap = exports.storeSourceMap = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const shared_1 = require("../shared");
function getSourceMapFilename(platform) {
    return `index${platform === 'app-android' ? '.kt' : '.swift'}.map`;
}
/**
 * 缓存 sourcemap
 * @param pluginRelativeDir
 * @param outputDir
 * @param cacheDir
 */
function storeSourceMap(platform, pluginRelativeDir, outputDir, cacheDir, is_uni_modules) {
    const sourceMapFilename = resolveSourceMapFilename(platform, pluginRelativeDir, outputDir, is_uni_modules);
    if ((0, fs_extra_1.existsSync)(sourceMapFilename)) {
        (0, fs_extra_1.copySync)(sourceMapFilename, resolveSourceMapCacheFilename(platform, cacheDir, pluginRelativeDir));
        return true;
    }
    return false;
}
exports.storeSourceMap = storeSourceMap;
/**
 * 拷贝 sourcemap
 * @param pluginRelativeDir
 * @param outputDir
 * @param cacheDir
 */
function restoreSourceMap(platform, pluginRelativeDir, outputDir, cacheDir, is_uni_modules) {
    const sourceMapCacheFile = resolveSourceMapCacheFile(platform, cacheDir, pluginRelativeDir);
    if (sourceMapCacheFile) {
        (0, fs_extra_1.copySync)(sourceMapCacheFile, resolveSourceMapFilename(platform, pluginRelativeDir, outputDir, is_uni_modules));
    }
}
exports.restoreSourceMap = restoreSourceMap;
function resolveSourceMapFilename(platform, pluginRelativeDir, outputDir, is_uni_modules) {
    return (0, path_1.join)((0, shared_1.resolveSourceMapPath)(outputDir, 'app'), pluginRelativeDir, is_uni_modules ? 'utssdk' : '', platform, getSourceMapFilename(platform));
}
exports.resolveSourceMapFilename = resolveSourceMapFilename;
function resolveSourceMapCacheFilename(platform, cacheDir, pluginRelativeDir) {
    return (0, path_1.join)(cacheDir, platform, 'uts', pluginRelativeDir, getSourceMapFilename(platform));
}
exports.resolveSourceMapCacheFilename = resolveSourceMapCacheFilename;
function resolveSourceMapCacheFile(platform, cacheDir, pluginRelativeDir) {
    const file = resolveSourceMapCacheFilename(platform, cacheDir, pluginRelativeDir);
    return ((0, fs_extra_1.existsSync)(file) && file) || '';
}
