"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNVueFlexDirection = exports.getNVueStyleCompiler = exports.getNVueCompiler = exports.initNVue = void 0;
function initNVue(manifestJson, pagesJson) { }
exports.initNVue = initNVue;
function getNVueCompiler(manifestJson) {
    const platformOptions = manifestJson['app-plus'];
    if (platformOptions) {
        const { nvueCompiler } = platformOptions;
        if (nvueCompiler === 'weex') {
            return 'weex';
        }
        if (nvueCompiler === 'vue') {
            return 'vue';
        }
        if (nvueCompiler === 'vite') {
            return 'vite';
        }
    }
    return 'uni-app';
}
exports.getNVueCompiler = getNVueCompiler;
function getNVueStyleCompiler(manifestJson) {
    const platformOptions = manifestJson['app-plus'];
    if (platformOptions && platformOptions.nvueStyleCompiler === 'uni-app') {
        return 'uni-app';
    }
    return 'weex';
}
exports.getNVueStyleCompiler = getNVueStyleCompiler;
const flexDirs = ['row', 'row-reverse', 'column', 'column-reverse'];
function getNVueFlexDirection(manifestJson) {
    let flexDir = 'column';
    if (manifestJson['app-plus']?.nvue?.['flex-direction']) {
        flexDir = manifestJson['app-plus'].nvue['flex-direction'];
        if (flexDirs.indexOf(flexDir) === -1) {
            flexDir = 'column';
        }
    }
    return flexDir;
}
exports.getNVueFlexDirection = getNVueFlexDirection;
//# sourceMappingURL=nvue.js.map