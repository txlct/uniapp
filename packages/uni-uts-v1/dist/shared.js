"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installHBuilderXPlugin = exports.normalizePath = exports.isWindows = exports.resolveSourceMapPath = exports.isInHBuilderX = exports.runByHBuilderX = exports.once = exports.parseJson = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const jsonc_parser_1 = require("jsonc-parser");
function parseJson(jsonStr) {
    return (0, jsonc_parser_1.parse)(jsonStr);
}
exports.parseJson = parseJson;
function once(fn, ctx = null) {
    let res;
    return ((...args) => {
        if (fn) {
            res = fn.apply(ctx, args);
            fn = null;
        }
        return res;
    });
}
exports.once = once;
exports.runByHBuilderX = once(() => {
    return (!!process.env.UNI_HBUILDERX_PLUGINS &&
        (!!process.env.RUN_BY_HBUILDERX || !!process.env.HX_Version));
});
exports.isInHBuilderX = once(() => {
    try {
        // eslint-disable-next-line no-restricted-globals
        const { name } = require(path_1.default.resolve(process.cwd(), '../about/package.json'));
        if (name === 'about') {
            process.env.UNI_HBUILDERX_PLUGINS = path_1.default.resolve(process.cwd(), '..');
            return true;
        }
    }
    catch (e) {
        // console.error(e)
    }
    return false;
});
function resolveSourceMapPath(outputDir, platform) {
    let dir = platform || process.env.UNI_SUB_PLATFORM || process.env.UNI_PLATFORM;
    if (dir === 'app-plus') {
        dir = 'app';
    }
    return path_1.default.resolve(outputDir || process.env.UNI_OUTPUT_DIR, '../.sourcemap/' + dir);
}
exports.resolveSourceMapPath = resolveSourceMapPath;
exports.isWindows = os_1.default.platform() === 'win32';
function normalizePath(id) {
    return exports.isWindows ? id.replace(/\\/g, '/') : id;
}
exports.normalizePath = normalizePath;
function supportAutoInstallPlugin() {
    return !!process.env.HX_Version;
}
function installHBuilderXPlugin(plugin) {
    if (!supportAutoInstallPlugin()) {
        return;
    }
    return console.error(`%HXRunUniAPPPluginName%${plugin}%HXRunUniAPPPluginName%`);
}
exports.installHBuilderXPlugin = installHBuilderXPlugin;
