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
exports.isColorSupported = exports.parseSwiftPackageWithPluginId = exports.parseKotlinPackageWithPluginId = exports.genConfigJson = exports.genComponentsCode = exports.resolveIOSComponents = exports.resolveAndroidComponents = exports.getCompilerServer = exports.createResolveTypeReferenceName = exports.resolveUTSPlatformFile = exports.resolveIOSDir = exports.resolveAndroidDir = exports.isRootIndex = exports.moveRootIndexSourceMap = exports.genUTSPlatformResource = exports.resolvePackage = exports.getUTSCompiler = exports.resolveUTSSourceMapPath = exports.ERR_MSG_PLACEHOLDER = void 0;
const path_1 = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const shared_1 = require("@vue/shared");
const fast_glob_1 = __importDefault(require("fast-glob"));
const shared_2 = require("./shared");
exports.ERR_MSG_PLACEHOLDER = `___ERR_MSG___`;
function resolveUTSSourceMapPath() {
    return (0, shared_2.resolveSourceMapPath)();
}
exports.resolveUTSSourceMapPath = resolveUTSSourceMapPath;
function getUTSCompiler() {
    // eslint-disable-next-line no-restricted-globals
    return require('@dcloudio/uts');
}
exports.getUTSCompiler = getUTSCompiler;
function resolvePackage(filename) {
    const parts = (0, shared_2.normalizePath)(filename).split('/');
    const isUniModules = parts.includes('uni_modules');
    const index = isUniModules
        ? parts.findIndex((part) => part === 'uni_modules')
        : parts.findIndex((part) => part === 'utssdk');
    if (index > -1) {
        const id = parts[index + 1];
        const name = (0, shared_1.camelize)(prefix(id));
        return {
            id,
            name,
            namespace: 'UTSSDK' + (isUniModules ? 'Modules' : '') + (0, shared_1.capitalize)(name),
            is_uni_modules: isUniModules,
            extname: '.uts',
        };
    }
}
exports.resolvePackage = resolvePackage;
function genUTSPlatformResource(filename, options) {
    const platformFile = resolveUTSPlatformFile(filename, options);
    const { platform } = options;
    const utsInputDir = resolveUTSPlatformDir(filename, platform);
    const utsOutputDir = resolveUTSPlatformDir(platformFile, platform);
    // 拷贝所有非uts,vue文件及目录
    if (fs_extra_1.default.existsSync(utsInputDir)) {
        fs_extra_1.default.copySync(utsInputDir, utsOutputDir, {
            filter(src) {
                if (src.endsWith('config.json')) {
                    return false;
                }
                return !['.uts', '.vue'].includes(path_1.default.extname(src));
            },
        });
    }
    copyConfigJson(utsInputDir, utsOutputDir, options.components, options.package);
    // 生产模式下，需要将生成的平台文件转移到 src 下
    const srcDir = path_1.default.resolve(utsOutputDir, 'src');
    if (!fs_extra_1.default.existsSync(srcDir)) {
        fs_extra_1.default.mkdirSync(srcDir);
    }
    if (fs_extra_1.default.existsSync(platformFile)) {
        fs_extra_1.default.moveSync(platformFile, path_1.default.resolve(utsOutputDir, 'src/index' + options.extname), {
            overwrite: true,
        });
    }
}
exports.genUTSPlatformResource = genUTSPlatformResource;
function moveRootIndexSourceMap(filename, { inputDir, platform, extname }) {
    if (isRootIndex(filename, platform)) {
        const sourceMapFilename = path_1.default
            .resolve(resolveUTSSourceMapPath(), path_1.default.relative(inputDir, filename))
            .replace(path_1.default.extname(filename), extname + '.map');
        if (fs_extra_1.default.existsSync(sourceMapFilename)) {
            const newSourceMapFilename = path_1.default.resolve(path_1.default.dirname(sourceMapFilename), platform, path_1.default.basename(sourceMapFilename));
            fs_extra_1.default.moveSync(sourceMapFilename, newSourceMapFilename, {
                overwrite: true,
            });
        }
    }
}
exports.moveRootIndexSourceMap = moveRootIndexSourceMap;
function isRootIndex(filename, platform) {
    return path_1.default.basename(path_1.default.dirname(filename)) !== platform;
}
exports.isRootIndex = isRootIndex;
function resolveAndroidDir(filename) {
    return resolveUTSPlatformDir(filename, 'app-android');
}
exports.resolveAndroidDir = resolveAndroidDir;
function resolveIOSDir(filename) {
    return resolveUTSPlatformDir(filename, 'app-ios');
}
exports.resolveIOSDir = resolveIOSDir;
function resolveUTSPlatformDir(filename, platform) {
    const maybePlatformDir = path_1.default.dirname(filename);
    if (isRootIndex(filename, platform)) {
        return path_1.default.join(maybePlatformDir, platform);
    }
    return maybePlatformDir;
}
function resolveUTSPlatformFile(filename, { inputDir, outputDir, platform, extname }) {
    let platformFile = path_1.default
        .resolve(outputDir, path_1.default.relative(inputDir, filename))
        .replace(path_1.default.extname(filename), extname);
    // 如果是根目录的 index.uts 编译出来的 index.kt，则移动到平台目录下
    if (isRootIndex(filename, platform)) {
        if (fs_extra_1.default.existsSync(platformFile)) {
            const newPlatformFile = path_1.default.resolve(path_1.default.dirname(platformFile), platform + '/index' + extname);
            fs_extra_1.default.moveSync(platformFile, newPlatformFile, {
                overwrite: true,
            });
            platformFile = newPlatformFile;
        }
    }
    return platformFile;
}
exports.resolveUTSPlatformFile = resolveUTSPlatformFile;
function resolveTypeAliasDeclNames(items) {
    const names = [];
    items.forEach((item) => {
        if (item.type === 'TsTypeAliasDeclaration') {
            names.push(item.id.value);
        }
    });
    return names;
}
function createResolveTypeReferenceName(namespace, ast) {
    const names = resolveTypeAliasDeclNames(ast.body);
    return (name) => {
        if (names.includes(name)) {
            return namespace + (0, shared_1.capitalize)(name);
        }
        return name;
    };
}
exports.createResolveTypeReferenceName = createResolveTypeReferenceName;
function getCompilerServer(pluginName) {
    const compilerServerPath = path_1.default.resolve(process.env.UNI_HBUILDERX_PLUGINS, `${pluginName}/out/${pluginName === 'uniapp-runextension' ? 'main.js' : 'external.js'}`);
    if (fs_extra_1.default.existsSync(compilerServerPath)) {
        // eslint-disable-next-line no-restricted-globals
        return require(compilerServerPath);
    }
    else {
        if ((0, shared_2.runByHBuilderX)()) {
            (0, shared_2.installHBuilderXPlugin)(pluginName);
        }
        else {
            console.error(compilerServerPath + ' is not found');
        }
    }
}
exports.getCompilerServer = getCompilerServer;
function resolveComponents(platform, pluginDir, is_uni_modules) {
    const components = {};
    const platformDir = path_1.default.resolve(pluginDir, is_uni_modules ? 'utssdk' : '', platform);
    if (fs_extra_1.default.existsSync(platformDir)) {
        fast_glob_1.default
            .sync('**/*.vue', { cwd: platformDir, absolute: true })
            .forEach((file) => {
            let name = parseVueComponentName(file);
            if (!name) {
                if (file.endsWith('index.vue')) {
                    name = path_1.default.basename(pluginDir);
                }
            }
            if (name && !components[name]) {
                components[name] = file;
            }
        });
    }
    return components;
}
function resolveAndroidComponents(pluginDir, is_uni_modules) {
    return resolveComponents('app-android', pluginDir, is_uni_modules);
}
exports.resolveAndroidComponents = resolveAndroidComponents;
function resolveIOSComponents(pluginDir, is_uni_modules) {
    return resolveComponents('app-ios', pluginDir, is_uni_modules);
}
exports.resolveIOSComponents = resolveIOSComponents;
const nameRE = /export\s+default\s+[\s\S]*?name\s*:\s*['|"](.*?)['|"]/;
function parseVueComponentName(file) {
    const content = fs_extra_1.default.readFileSync(file, 'utf8');
    const matches = content.match(nameRE);
    if (matches) {
        return matches[1];
    }
}
function genComponentsCode(filename, components) {
    const codes = [];
    const dirname = path_1.default.dirname(filename);
    Object.keys(components).forEach((name) => {
        const source = (0, shared_2.normalizePath)(path_1.default.relative(dirname, components[name]));
        codes.push(`export { default as ${(0, shared_1.capitalize)((0, shared_1.camelize)(name))}Component } from '${source.startsWith('.') ? source : './' + source}'`);
    });
    return codes.join('\n');
}
exports.genComponentsCode = genComponentsCode;
function genConfigJson(platform, components, pluginRelativeDir, is_uni_modules, inputDir, outputDir) {
    if (!Object.keys(components).length) {
        return;
    }
    const pluginId = (0, path_1.basename)(pluginRelativeDir);
    const utsInputDir = (0, path_1.resolve)(inputDir, pluginRelativeDir, is_uni_modules ? 'utssdk' : '', platform);
    const utsOutputDir = (0, path_1.resolve)(outputDir, pluginRelativeDir, is_uni_modules ? 'utssdk' : '', platform);
    copyConfigJson(utsInputDir, utsOutputDir, components, platform === 'app-android'
        ? parseKotlinPackageWithPluginId(pluginId, is_uni_modules) + '.'
        : parseSwiftPackageWithPluginId(pluginId, is_uni_modules));
}
exports.genConfigJson = genConfigJson;
function copyConfigJson(inputDir, outputDir, componentsObj, namespace) {
    const configJsonFilename = (0, path_1.resolve)(inputDir, 'config.json');
    const outputConfigJsonFilename = (0, path_1.resolve)(outputDir, 'config.json');
    if (Object.keys(componentsObj).length) {
        //存在组件
        const components = genComponentsConfigJson(componentsObj, namespace);
        if (fs_extra_1.default.existsSync(configJsonFilename)) {
            fs_extra_1.default.outputFileSync(outputConfigJsonFilename, JSON.stringify((0, shared_1.extend)({ components }, (0, shared_2.parseJson)(fs_extra_1.default.readFileSync(configJsonFilename, 'utf8'))), null, 2));
        }
        else {
            fs_extra_1.default.outputFileSync(outputConfigJsonFilename, JSON.stringify({ components }, null, 2));
        }
    }
    else {
        if (fs_extra_1.default.existsSync(configJsonFilename)) {
            fs_extra_1.default.copySync(configJsonFilename, outputConfigJsonFilename);
        }
    }
}
function genComponentsConfigJson(components, namespace) {
    const res = [];
    Object.keys(components).forEach((name) => {
        res.push({
            name,
            class: namespace + (0, shared_1.capitalize)((0, shared_1.camelize)(name)) + 'Component',
        });
    });
    return res;
}
function prefix(id) {
    if (process.env.UNI_UTS_MODULE_PREFIX &&
        !id.startsWith(process.env.UNI_UTS_MODULE_PREFIX)) {
        return process.env.UNI_UTS_MODULE_PREFIX + '-' + id;
    }
    return id;
}
function parseKotlinPackageWithPluginId(id, is_uni_modules) {
    return 'uts.sdk.' + (is_uni_modules ? 'modules.' : '') + (0, shared_1.camelize)(prefix(id));
}
exports.parseKotlinPackageWithPluginId = parseKotlinPackageWithPluginId;
function parseSwiftPackageWithPluginId(id, is_uni_modules) {
    return ('UTSSDK' +
        (is_uni_modules ? 'Modules' : '') +
        (0, shared_1.capitalize)((0, shared_1.camelize)(prefix(id))));
}
exports.parseSwiftPackageWithPluginId = parseSwiftPackageWithPluginId;
function isColorSupported() {
    if ('NO_COLOR' in process.env || (0, shared_2.isInHBuilderX)()) {
        return false;
    }
    return true;
}
exports.isColorSupported = isColorSupported;
