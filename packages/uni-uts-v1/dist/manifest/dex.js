"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDex = exports.storeDex = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
function dexName() {
    return 'classes.dex';
}
function storeDex(dexFile, pluginRelativeDir, outputDir) {
    (0, fs_extra_1.copySync)(dexFile, resolveDexCacheFilename(pluginRelativeDir, outputDir));
}
exports.storeDex = storeDex;
function restoreDex(pluginRelativeDir, outputDir, is_uni_modules) {
    const cacheFile = resolveDexCacheFile(pluginRelativeDir, outputDir);
    if (cacheFile) {
        (0, fs_extra_1.copySync)(cacheFile, (0, path_1.join)(outputDir, pluginRelativeDir, is_uni_modules ? 'utssdk' : '', 'app-android', dexName()));
    }
}
exports.restoreDex = restoreDex;
function resolveDexCacheFilename(pluginRelativeDir, outputDir) {
    return (0, path_1.join)(outputDir, '../.uts/dex', pluginRelativeDir, dexName());
}
function resolveDexCacheFile(pluginRelativeDir, outputDir) {
    const file = resolveDexCacheFilename(pluginRelativeDir, outputDir);
    return ((0, fs_extra_1.existsSync)(file) && file) || '';
}
