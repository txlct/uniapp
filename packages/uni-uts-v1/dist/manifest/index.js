"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCheckOptionsEnv = exports.checkCompile = exports.checkSwiftCompile = exports.checkKotlinCompile = exports.storeSourceMap = exports.restoreSourceMap = exports.storeDex = exports.restoreDex = exports.genManifestFile = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const shared_1 = require("../shared");
const manifest_1 = require("./manifest");
const utils_1 = require("./utils");
var manifest_2 = require("./manifest");
Object.defineProperty(exports, "genManifestFile", { enumerable: true, get: function () { return manifest_2.genManifestFile; } });
var dex_1 = require("./dex");
Object.defineProperty(exports, "restoreDex", { enumerable: true, get: function () { return dex_1.restoreDex; } });
Object.defineProperty(exports, "storeDex", { enumerable: true, get: function () { return dex_1.storeDex; } });
var sourceMap_1 = require("./sourceMap");
Object.defineProperty(exports, "restoreSourceMap", { enumerable: true, get: function () { return sourceMap_1.restoreSourceMap; } });
Object.defineProperty(exports, "storeSourceMap", { enumerable: true, get: function () { return sourceMap_1.storeSourceMap; } });
const ANDROID_CUSTOM_RES = [
    'app-android/assets/',
    'app-android/libs/',
    'app-android/res/',
    'app-android/AndroidManifest.xml',
];
const IOS_CUSTOM_RES = [
    'app-ios/Frameworks/',
    'app-ios/Resources/',
    'app-ios/Info.plist',
];
function checkKotlinCompile(playground, options) {
    return checkCompile('app-android', playground, options);
}
exports.checkKotlinCompile = checkKotlinCompile;
function checkSwiftCompile(playground, options) {
    return checkCompile('app-ios', playground, options);
}
exports.checkSwiftCompile = checkSwiftCompile;
function checkCompile(platform, playground, options) {
    const platformOptions = {
        customRes: platform === 'app-android' ? ANDROID_CUSTOM_RES : IOS_CUSTOM_RES,
    };
    if (playground === 'standard') {
        return checkWithPlayground(platform, 'standard', options, platformOptions);
    }
    return checkWithPlayground(platform, 'custom', options, platformOptions);
}
exports.checkCompile = checkCompile;
async function checkWithPlayground(platform, type, { id, env, cacheDir, pluginDir, pluginRelativeDir, is_uni_modules, }, { customRes }) {
    // 第一步：获取所有文件列表
    const files = await (0, manifest_1.resolvePluginFiles)(platform, pluginDir, is_uni_modules);
    let tips = '';
    // 标准基座检查是否包含原生资源/配置
    if (type === 'standard') {
        if ((0, manifest_1.hasCustomResources)(files, customRes)) {
            tips = (0, utils_1.customResourceTips)(id);
        }
        else {
            // 检查 config.json
            if (platform === 'app-android') {
                if (androidHasCustomConfigJson(pluginDir, is_uni_modules)) {
                    tips = (0, utils_1.customResourceTips)(id);
                }
            }
            else if (platform === 'app-ios') {
                if (iOSHasCustomConfigJson(pluginDir, is_uni_modules)) {
                    tips = (0, utils_1.customResourceTips)(id);
                }
            }
        }
    }
    // 第二步：获取当前插件缓存文件信息
    const manifest = (0, manifest_1.resolveManifestJson)(platform, pluginRelativeDir, cacheDir);
    if (!manifest) {
        return { expired: true, tips, files };
    }
    // 第四步：检查文件变更
    const res = await (0, manifest_1.checkManifest)(manifest, { env, files, pluginDir });
    // 自定义基座检查原生资源/配置是否发生变化
    if (type === 'custom' && typeof res === 'string') {
        if ((0, manifest_1.isCustomResources)(res, customRes)) {
            tips = (0, utils_1.customResourceChangedTips)(id);
        }
    }
    return {
        expired: res !== true,
        tips,
        files,
    };
}
function initCheckOptionsEnv() {
    return {
        compilerVersion: require('../../package.json').version,
    };
}
exports.initCheckOptionsEnv = initCheckOptionsEnv;
function androidHasCustomConfigJson(pluginDir, is_uni_modules) {
    return hasCustomConfigJson('app-android', 'minSdkVersion', pluginDir, is_uni_modules);
}
function iOSHasCustomConfigJson(pluginDir, is_uni_modules) {
    return hasCustomConfigJson('app-ios', 'deploymentTarget', pluginDir, is_uni_modules);
}
function hasCustomConfigJson(platform, key, pluginDir, is_uni_modules) {
    const configJsonFile = (0, path_1.join)(pluginDir, is_uni_modules ? 'utssdk' : '', platform, 'config.json');
    if (configJsonFile && (0, fs_extra_1.existsSync)(configJsonFile)) {
        try {
            const configJson = (0, shared_1.parseJson)((0, fs_extra_1.readFileSync)(configJsonFile, 'utf8'));
            const len = Object.keys(configJson).length;
            if (len > 1) {
                return true;
            }
            if (len === 1) {
                if (!configJson.hasOwnProperty(key)) {
                    return true;
                }
            }
        }
        catch (e) { }
    }
    return false;
}
