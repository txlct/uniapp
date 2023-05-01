"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformType = exports.isMiniProgramPlatform = exports.getPlatformDir = exports.getPlatforms = exports.registerPlatform = void 0;
const BUILT_IN_PLATFORMS = [
    'app',
    'app-plus',
    'h5',
    'mp-360',
    'mp-alipay',
    'mp-baidu',
    'mp-jd',
    'mp-kuaishou',
    'mp-lark',
    'mp-qq',
    'mp-toutiao',
    'mp-weixin',
    'quickapp-webview',
    'quickapp-webview-huawei',
    'quickapp-webview-union',
];
const platforms = [...BUILT_IN_PLATFORMS];
function registerPlatform(platform) {
    if (!platforms.includes(platform)) {
        platforms.push(platform);
    }
}
exports.registerPlatform = registerPlatform;
function getPlatforms() {
    return platforms;
}
exports.getPlatforms = getPlatforms;
function getPlatformDir() {
    return process.env.UNI_SUB_PLATFORM || process.env.UNI_PLATFORM;
}
exports.getPlatformDir = getPlatformDir;
function isMiniProgramPlatform() {
    return !['app', 'app-plus', 'h5', 'web'].includes(process.env.UNI_PLATFORM);
}
exports.isMiniProgramPlatform = isMiniProgramPlatform;
const getPlatformType = () => {
    const PLATFORM_TYPE = process.env.PLATFORM_TYPE || '';
    const PREFIX = process.env.PREFIX || '';
    const name = `${PREFIX}${PLATFORM_TYPE}`;
    return {
        name,
        entryName: name || 'index',
        assetsName: name ? `${name}/` : '',
        PLATFORM_TYPE,
        PREFIX
    };
};
exports.getPlatformType = getPlatformType;
//# sourceMappingURL=platform.js.map