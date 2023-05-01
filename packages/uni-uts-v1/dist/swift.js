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
exports.checkIOSVersionTips = exports.resolveIOSDepFiles = exports.compile = exports.runSwiftDev = exports.runSwiftProd = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importStar(require("path"));
const utils_1 = require("./utils");
const shared_1 = require("./shared");
function parseSwiftPackage(filename) {
    const res = (0, utils_1.resolvePackage)(filename);
    if (!res) {
        return {
            id: '',
            namespace: '',
        };
    }
    const namespace = (0, utils_1.parseSwiftPackageWithPluginId)(res.name, res.is_uni_modules);
    return {
        id: res.id,
        namespace,
    };
}
async function runSwiftProd(filename, components) {
    // 文件有可能是 app-android 里边的，因为编译到 ios 时，为了保证不报错，可能会去读取 android 下的 uts
    if (filename.includes('app-android')) {
        return;
    }
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    const res = await compile(filename, {
        inputDir,
        outputDir,
        sourceMap: true,
        components,
    });
    if (!res) {
        return;
    }
    (0, utils_1.genUTSPlatformResource)(filename, {
        inputDir,
        outputDir,
        platform: 'app-ios',
        extname: '.swift',
        components,
        package: parseSwiftPackage(filename).namespace,
    });
}
exports.runSwiftProd = runSwiftProd;
let isEnvReady = true;
async function runSwiftDev(filename, components) {
    // 文件有可能是 app-android 里边的，因为编译到 ios 时，为了保证不报错，可能会去读取 android 下的 uts
    if (filename.includes('app-android')) {
        return;
    }
    if (!isEnvReady) {
        console.error(`已跳过uts插件[${(0, utils_1.resolvePackage)(filename)?.id}]的编译`);
        return;
    }
    const compilerServer = (0, utils_1.getCompilerServer)('uts-development-ios');
    if (!compilerServer) {
        throw `项目使用了uts插件，正在安装 uts iOS 运行扩展...`;
    }
    if (compilerServer.checkEnv) {
        const { code, msg } = compilerServer.checkEnv();
        if (code) {
            isEnvReady = false;
            console.error(msg);
            return;
        }
    }
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    const result = (await compile(filename, {
        inputDir,
        outputDir,
        sourceMap: true,
        components,
    }));
    if (!result) {
        return;
    }
    result.type = 'swift';
    const swiftFile = (0, utils_1.resolveUTSPlatformFile)(filename, {
        inputDir,
        outputDir,
        platform: 'app-ios',
        extname: '.swift',
        components,
        package: '',
    });
    result.changed = [];
    // 开发模式下，需要生成 framework
    if (fs_extra_1.default.existsSync(swiftFile)) {
        let projectPath = inputDir;
        const isCli = isCliProject(projectPath);
        if (isCli) {
            projectPath = path_1.default.resolve(projectPath, '..');
        }
        const { id, is_uni_modules } = (0, utils_1.resolvePackage)(filename);
        const { code, msg } = await compilerServer.compile({
            projectPath,
            isCli,
            type: is_uni_modules ? 1 : 2,
            pluginName: id,
            utsPath: resolveCompilerUTSPath(inputDir, is_uni_modules),
            swiftPath: resolveCompilerSwiftPath(outputDir, is_uni_modules),
        });
        result.code = code;
        result.msg = msg;
        result.changed = [swiftFile];
    }
    return result;
}
exports.runSwiftDev = runSwiftDev;
function resolveCompilerUTSPath(projectPath, is_uni_modules) {
    return path_1.default.resolve(projectPath, is_uni_modules ? 'uni_modules' : 'utssdk');
}
function resolveCompilerSwiftPath(outputDir, is_uni_modules) {
    return path_1.default.resolve(outputDir, is_uni_modules ? 'uni_modules' : 'utssdk');
}
function isCliProject(projectPath) {
    if (projectPath.endsWith('src')) {
        return true;
    }
    return false;
}
async function compile(filename, { inputDir, outputDir, sourceMap, components }) {
    const { bundle, UTSTarget } = (0, utils_1.getUTSCompiler)();
    // let time = Date.now()
    const componentsCode = (0, utils_1.genComponentsCode)(filename, components);
    const { namespace, id: pluginId } = parseSwiftPackage(filename);
    const input = {
        root: inputDir,
        filename,
        pluginId,
        paths: {},
    };
    const isUTSFileExists = fs_extra_1.default.existsSync(filename);
    if (componentsCode) {
        if (!isUTSFileExists) {
            input.fileContent = componentsCode;
        }
        else {
            input.fileContent =
                fs_extra_1.default.readFileSync(filename, 'utf8') + `\n` + componentsCode;
        }
    }
    else {
        // uts文件不存在，且也无组件
        if (!isUTSFileExists) {
            return;
        }
    }
    const result = await bundle(UTSTarget.SWIFT, {
        input,
        output: {
            isPlugin: true,
            outDir: outputDir,
            package: namespace,
            sourceMap: sourceMap ? (0, utils_1.resolveUTSSourceMapPath)() : false,
            extname: 'swift',
            imports: ['DCloudUTSFoundation'],
            logFilename: true,
            noColor: !(0, utils_1.isColorSupported)(),
        },
    });
    sourceMap &&
        (0, utils_1.moveRootIndexSourceMap)(filename, {
            inputDir,
            outputDir,
            platform: 'app-ios',
            extname: '.swift',
            components,
            package: '',
        });
    return result;
}
exports.compile = compile;
const deps = ['Info.plist', 'config.json'];
function resolveIOSDepFiles(filename) {
    const dir = (0, utils_1.resolveIOSDir)(filename);
    return deps.map((dep) => path_1.default.resolve(dir, dep));
}
exports.resolveIOSDepFiles = resolveIOSDepFiles;
function checkIOSVersionTips(pluginId, pluginDir, is_uni_modules) {
    const configJsonFile = (0, path_1.join)(pluginDir, is_uni_modules ? 'utssdk' : '', 'app-ios', 'config.json');
    if (configJsonFile && fs_extra_1.default.existsSync(configJsonFile)) {
        try {
            const configJson = (0, shared_1.parseJson)(fs_extra_1.default.readFileSync(configJsonFile, 'utf8'));
            if (configJson.deploymentTarget) {
                return `uts插件[${pluginId}]需在 iOS ${configJson.deploymentTarget} 版本及以上方可正常使用`;
            }
        }
        catch (e) { }
    }
}
exports.checkIOSVersionTips = checkIOSVersionTips;
