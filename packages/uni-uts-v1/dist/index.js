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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.toSwift = exports.toKotlin = exports.sourcemap = void 0;
const shared_1 = require("@vue/shared");
const path_1 = require("path");
const kotlin_1 = require("./kotlin");
const swift_1 = require("./swift");
const code_1 = require("./code");
const utils_1 = require("./utils");
const stacktrace_1 = require("./stacktrace");
const sourceMap_1 = require("./sourceMap");
const shared_2 = require("./shared");
const legacy_1 = require("./legacy");
const manifest_1 = require("./manifest");
const utils_2 = require("./manifest/utils");
const encrypt_1 = require("./encrypt");
exports.sourcemap = {
    generateCodeFrameWithKotlinStacktrace: legacy_1.generateCodeFrameWithKotlinStacktrace,
    generateCodeFrameWithSwiftStacktrace: legacy_1.generateCodeFrameWithSwiftStacktrace,
};
__exportStar(require("./sourceMap"), exports);
var kotlin_2 = require("./kotlin");
Object.defineProperty(exports, "toKotlin", { enumerable: true, get: function () { return kotlin_2.compile; } });
var swift_2 = require("./swift");
Object.defineProperty(exports, "toSwift", { enumerable: true, get: function () { return swift_2.compile; } });
function parseErrMsg(code, errMsg) {
    return code.replace(utils_1.ERR_MSG_PLACEHOLDER, errMsg);
}
function compileErrMsg(id) {
    return `uts插件[${id}]编译失败，无法使用`;
}
function warn(msg) {
    console.warn(`提示：${msg}`);
}
function createResult(errMsg, code, deps) {
    return {
        code: parseErrMsg(code, errMsg),
        deps,
        encrypt: false,
        meta: {},
    };
}
async function compile(pluginDir) {
    const pkg = (0, utils_1.resolvePackage)(pluginDir);
    if (!pkg) {
        return;
    }
    // 加密插件
    if ((0, encrypt_1.isEncrypt)(pluginDir)) {
        return (0, encrypt_1.compileEncrypt)(pluginDir);
    }
    const cacheDir = process.env.HX_DEPENDENCIES_DIR;
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    const utsPlatform = process.env.UNI_UTS_PLATFORM;
    const pluginRelativeDir = (0, path_1.relative)(inputDir, pluginDir);
    const androidComponents = (0, utils_1.resolveAndroidComponents)(pluginDir, pkg.is_uni_modules);
    const iosComponents = (0, utils_1.resolveIOSComponents)(pluginDir, pkg.is_uni_modules);
    const env = (0, manifest_1.initCheckOptionsEnv)();
    const deps = [];
    const code = await (0, code_1.genProxyCode)(pluginDir, (0, shared_1.extend)({
        androidComponents,
        iosComponents,
        format: process.env.UNI_UTS_JS_CODE_FORMAT === 'cjs'
            ? "cjs" /* FORMATS.CJS */
            : "es" /* FORMATS.ES */,
        pluginRelativeDir,
        moduleName: require((0, path_1.join)(pluginDir, 'package.json')).displayName || pkg.id,
        moduleType: process.env.UNI_UTS_MODULE_TYPE || '',
    }, pkg));
    let errMsg = '';
    if (process.env.NODE_ENV !== 'development') {
        // 生产模式 支持同时生成 android 和 ios 的 uts 插件
        if (utsPlatform === 'app-android' || utsPlatform === 'app') {
            let filename = (0, code_1.resolvePlatformIndex)('app-android', pluginDir, pkg) ||
                (0, code_1.resolveRootIndex)(pluginDir, pkg);
            if (!filename && Object.keys(androidComponents).length) {
                filename = (0, code_1.resolvePlatformIndexFilename)('app-android', pluginDir, pkg);
            }
            if (filename) {
                await getCompiler('kotlin').runProd(filename, androidComponents);
                if (cacheDir) {
                    // 存储 sourcemap
                    (0, manifest_1.storeSourceMap)('app-android', pluginRelativeDir, outputDir, cacheDir, pkg.is_uni_modules);
                    (0, manifest_1.genManifestFile)('app-android', {
                        pluginDir,
                        env,
                        cacheDir,
                        pluginRelativeDir,
                        is_uni_modules: pkg.is_uni_modules,
                    });
                }
            }
        }
        if (utsPlatform === 'app-ios' || utsPlatform === 'app') {
            let filename = (0, code_1.resolvePlatformIndex)('app-ios', pluginDir, pkg) ||
                (0, code_1.resolveRootIndex)(pluginDir, pkg);
            if (!filename && Object.keys(androidComponents).length) {
                filename = (0, code_1.resolvePlatformIndexFilename)('app-ios', pluginDir, pkg);
            }
            if (filename) {
                await getCompiler('swift').runProd(filename, iosComponents);
                if (cacheDir) {
                    (0, manifest_1.storeSourceMap)('app-ios', pluginRelativeDir, outputDir, cacheDir, pkg.is_uni_modules);
                    (0, manifest_1.genManifestFile)('app-ios', {
                        pluginDir,
                        env,
                        cacheDir,
                        pluginRelativeDir,
                        is_uni_modules: pkg.is_uni_modules,
                    });
                }
            }
        }
    }
    else {
        const compilerType = utsPlatform === 'app-android' ? 'kotlin' : 'swift';
        const versionTips = getCompiler(compilerType).checkVersionTips(pkg.id, pluginDir, pkg.is_uni_modules);
        // iOS windows 平台，标准基座不编译
        if (utsPlatform === 'app-ios') {
            if (shared_2.isWindows) {
                process.env.UNI_UTS_TIPS = `iOS手机在windows上真机运行时uts插件代码修改需提交云端打包自定义基座才能生效`;
                return createResult(errMsg, code, deps);
            }
            // ios 模拟器不支持
            if (process.env.HX_RUN_DEVICE_TYPE === 'ios_simulator') {
                process.env.UNI_UTS_TIPS = `iOS手机在模拟器运行暂不支持uts插件，如需调用uts插件请使用自定义基座`;
                return createResult(compileErrMsg(pkg.id), code, deps);
            }
        }
        if (utsPlatform === 'app-android' || utsPlatform === 'app-ios') {
            const components = utsPlatform === 'app-android' ? androidComponents : iosComponents;
            let tips = '';
            // dev 模式
            if (cacheDir) {
                // 检查缓存
                // let start = Date.now()
                // console.log('uts插件[' + pkg.id + ']start', start)
                const res = await (0, manifest_1.checkCompile)(utsPlatform, process.env.HX_USE_BASE_TYPE, {
                    id: pkg.id,
                    env,
                    cacheDir,
                    outputDir,
                    pluginDir,
                    pluginRelativeDir,
                    is_uni_modules: pkg.is_uni_modules,
                });
                if (res.tips) {
                    tips = res.tips;
                }
                // console.log('uts插件[' + pkg.id + ']end', Date.now())
                // console.log('uts插件[' + pkg.id + ']缓存检查耗时：', Date.now() - start)
                if (!res.expired) {
                    if (utsPlatform === 'app-android') {
                        (0, manifest_1.restoreDex)(pluginRelativeDir, outputDir, pkg.is_uni_modules);
                    }
                    // 还原 sourcemap
                    (0, manifest_1.restoreSourceMap)(utsPlatform, pluginRelativeDir, outputDir, cacheDir, pkg.is_uni_modules);
                    // 处理 config.json
                    (0, utils_1.genConfigJson)(utsPlatform, components, pluginRelativeDir, pkg.is_uni_modules, inputDir, outputDir);
                    console.log((0, utils_2.cacheTips)(pkg.id));
                    if (res.tips) {
                        warn(res.tips);
                    }
                    if (versionTips) {
                        warn(versionTips);
                    }
                    // 所有文件加入依赖
                    return createResult(errMsg, code, res.files.map((name) => (0, path_1.join)(pluginDir, name)));
                }
            }
            let filename = (0, code_1.resolvePlatformIndex)(utsPlatform, pluginDir, pkg) ||
                (0, code_1.resolveRootIndex)(pluginDir, pkg);
            if (!filename && Object.keys(androidComponents).length) {
                filename = (0, code_1.resolvePlatformIndexFilename)(utsPlatform, pluginDir, pkg);
            }
            if (filename) {
                deps.push(filename);
                if (utsPlatform === 'app-android') {
                    deps.push(...(0, kotlin_1.resolveAndroidDepFiles)(filename));
                }
                else {
                    deps.push(...(0, swift_1.resolveIOSDepFiles)(filename));
                }
                // 处理 config.json
                (0, utils_1.genConfigJson)(utsPlatform, components, pluginRelativeDir, pkg.is_uni_modules, inputDir, outputDir);
                const res = await getCompiler(compilerType).runDev(filename, components);
                if (res) {
                    if ((0, shared_1.isArray)(res.deps) && res.deps.length) {
                        // 添加其他文件的依赖
                        deps.push(...res.deps);
                    }
                    let isSuccess = false;
                    if (res.type === 'swift') {
                        if (res.code) {
                            errMsg = compileErrMsg(pkg.id);
                            console.error(`error: ` +
                                (await (0, stacktrace_1.parseUTSSwiftPluginStacktrace)({
                                    stacktrace: res.msg,
                                    sourceMapFile: (0, sourceMap_1.resolveUTSPluginSourceMapFile)('swift', filename, inputDir, outputDir),
                                    sourceRoot: inputDir,
                                })));
                        }
                        else {
                            isSuccess = true;
                        }
                    }
                    else if (res.type === 'kotlin') {
                        if (res.changed.length) {
                            isSuccess = true;
                        }
                    }
                    if (isSuccess) {
                        // 生成缓存文件
                        if (cacheDir) {
                            // 存储 sourcemap
                            (0, manifest_1.storeSourceMap)(utsPlatform, pluginRelativeDir, outputDir, cacheDir, pkg.is_uni_modules);
                            // 生成 manifest
                            (0, manifest_1.genManifestFile)(utsPlatform, {
                                pluginDir,
                                env,
                                cacheDir,
                                pluginRelativeDir,
                                is_uni_modules: pkg.is_uni_modules,
                            });
                        }
                        if (tips) {
                            warn(tips);
                        }
                        if (versionTips) {
                            warn(versionTips);
                        }
                    }
                    const files = [];
                    if (process.env.UNI_APP_UTS_CHANGED_FILES) {
                        try {
                            files.push(...JSON.parse(process.env.UNI_APP_UTS_CHANGED_FILES));
                        }
                        catch (e) { }
                    }
                    if (res.changed && res.changed.length) {
                        files.push(...res.changed);
                        // 需要缓存 dex 文件
                        if (cacheDir && res.type === 'kotlin') {
                            res.changed.forEach((file) => {
                                if (file.endsWith('classes.dex')) {
                                    (0, manifest_1.storeDex)((0, path_1.join)(outputDir, file), pluginRelativeDir, outputDir);
                                }
                            });
                        }
                    }
                    else {
                        if (res.type === 'kotlin') {
                            errMsg = compileErrMsg(pkg.id);
                        }
                    }
                    process.env.UNI_APP_UTS_CHANGED_FILES = JSON.stringify([
                        ...new Set(files),
                    ]);
                }
                else {
                    errMsg = compileErrMsg(pkg.id);
                }
            }
        }
    }
    return createResult(errMsg, code, deps);
}
exports.compile = compile;
function getCompiler(type) {
    if (type === 'swift') {
        return {
            runProd: swift_1.runSwiftProd,
            runDev: swift_1.runSwiftDev,
            checkVersionTips: swift_1.checkIOSVersionTips,
        };
    }
    return {
        runProd: kotlin_1.runKotlinProd,
        runDev: kotlin_1.runKotlinDev,
        checkVersionTips: kotlin_1.checkAndroidVersionTips,
    };
}
