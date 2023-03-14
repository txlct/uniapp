"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJsCodeCacheFilename = exports.compileEncrypt = exports.isEncrypt = void 0;
const path_1 = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const shared_1 = require("./shared");
function isEncrypt(pluginDir) {
    return fs_extra_1.default.existsSync(path_1.default.resolve(pluginDir, 'encrypt'));
}
exports.isEncrypt = isEncrypt;
function createRollupCommonjsCode(pluginDir, pluginRelativeDir) {
    return `
import * as commonjsHelpers from "\0commonjsHelpers.js"

import { __module, exports as __exports } from "\0${(0, shared_1.normalizePath)(pluginDir)}?commonjs-module"

Object.defineProperty(__exports, '__esModule', { value: true })      
__module.exports = uni.requireUTSPlugin('${(0, shared_1.normalizePath)(pluginRelativeDir)}')

export default /*@__PURE__*/commonjsHelpers.getDefaultExportFromCjs(__exports);
export { __exports as __moduleExports };
`;
}
function createWebpackCommonjsCode(pluginRelativeDir) {
    return `
module.exports = uni.requireUTSPlugin('${(0, shared_1.normalizePath)(pluginRelativeDir)}')
`;
}
async function compileEncrypt(pluginDir) {
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    const utsPlatform = process.env.UNI_UTS_PLATFORM;
    const isRollup = !!process.env.UNI_UTS_USING_ROLLUP;
    const pluginRelativeDir = (0, path_1.relative)(inputDir, pluginDir);
    let code = isRollup
        ? createRollupCommonjsCode(pluginDir, pluginRelativeDir)
        : createWebpackCommonjsCode(pluginRelativeDir);
    if (process.env.NODE_ENV !== 'development') {
        // 复制插件目录
        fs_extra_1.default.copySync(pluginDir, (0, path_1.join)(outputDir, pluginRelativeDir));
        return {
            code,
            deps: [],
            encrypt: true,
            meta: { commonjs: { isCommonJS: true } },
        };
    }
    // 读取缓存目录的 js code
    const cacheDir = process.env.HX_DEPENDENCIES_DIR;
    const indexJsPath = resolveJsCodeCacheFilename(utsPlatform, cacheDir, pluginRelativeDir);
    if (fs_extra_1.default.existsSync(indexJsPath)) {
        code = fs_extra_1.default.readFileSync(indexJsPath, 'utf-8') + code;
    }
    else {
        console.error(`uts插件[${path_1.default.basename(pluginDir)}]不存在，请重新打包自定义基座`);
    }
    return {
        code,
        deps: [],
        encrypt: true,
        meta: { commonjs: { isCommonJS: true } },
    };
}
exports.compileEncrypt = compileEncrypt;
function resolveJsCodeCacheFilename(platform, cacheDir, pluginRelativeDir) {
    return (0, path_1.join)(cacheDir, platform, 'uts', pluginRelativeDir, 'index.js');
}
exports.resolveJsCodeCacheFilename = resolveJsCodeCacheFilename;
