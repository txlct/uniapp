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
exports.checkAndroidVersionTips = exports.compile = exports.resolveAndroidDepFiles = exports.runKotlinDev = exports.runKotlinProd = exports.createKotlinResolveTypeReferenceName = void 0;
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importStar(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const fast_glob_1 = require("fast-glob");
const shared_1 = require("@vue/shared");
const android_versions_1 = require("android-versions");
const shared_2 = require("./shared");
const utils_1 = require("./utils");
function createKotlinResolveTypeReferenceName(_namespace, _ast) {
    return (name) => name;
}
exports.createKotlinResolveTypeReferenceName = createKotlinResolveTypeReferenceName;
function parseKotlinPackage(filename) {
    const res = (0, utils_1.resolvePackage)(filename);
    if (!res) {
        return { id: '', package: '' };
    }
    return {
        id: res.id,
        package: (0, utils_1.parseKotlinPackageWithPluginId)(res.name, res.is_uni_modules),
    };
}
async function runKotlinProd(filename, components) {
    // 文件有可能是 app-ios 里边的，因为编译到 android 时，为了保证不报错，可能会去读取 ios 下的 uts
    if (filename.includes('app-ios')) {
        return;
    }
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    let res = await compile(filename, {
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
        platform: 'app-android',
        extname: '.kt',
        components,
        package: parseKotlinPackage(filename).package + '.',
    });
}
exports.runKotlinProd = runKotlinProd;
async function runKotlinDev(filename, components) {
    // 文件有可能是 app-ios 里边的，因为编译到 android 时，为了保证不报错，可能会去读取 ios 下的 uts
    if (filename.includes('app-ios')) {
        return;
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
    result.type = 'kotlin';
    result.changed = [];
    const kotlinFile = (0, utils_1.resolveUTSPlatformFile)(filename, {
        inputDir,
        outputDir,
        platform: 'app-android',
        extname: '.kt',
        components,
        package: '',
    });
    // 开发模式下，需要生成 dex
    if (fs_extra_1.default.existsSync(kotlinFile)) {
        const compilerServer = (0, utils_1.getCompilerServer)('uniapp-runextension');
        if (!compilerServer) {
            throw `项目使用了uts插件，正在安装 uts Android 运行扩展...`;
        }
        const { getDefaultJar, getKotlincHome, compile: compileDex, checkDependencies, checkRResources, } = compilerServer;
        let deps = [];
        if (checkDependencies) {
            deps = await checkDeps(filename, checkDependencies);
        }
        let resDeps = [];
        if (checkRResources) {
            resDeps = await checkRes(filename, checkRResources);
        }
        // time = Date.now()
        const jarFile = resolveJarPath(kotlinFile);
        const options = {
            kotlinc: resolveKotlincArgs(kotlinFile, getKotlincHome(), getDefaultJar()
                .concat(resolveLibs(filename))
                .concat(deps)
                .concat(resDeps)),
            d8: resolveD8Args(jarFile),
            sourceRoot: inputDir,
            sourceMapPath: resolveSourceMapFile(outputDir, kotlinFile),
        };
        const res = await compileDex(options, inputDir);
        // console.log('dex compile time: ' + (Date.now() - time) + 'ms')
        if (res) {
            try {
                fs_extra_1.default.unlinkSync(jarFile);
                // 短期内先不删除，方便排查问题
                // fs.unlinkSync(kotlinFile)
            }
            catch (e) { }
            const dexFile = resolveDexFile(jarFile);
            if (fs_extra_1.default.existsSync(dexFile)) {
                result.changed = [(0, shared_2.normalizePath)(path_1.default.relative(outputDir, dexFile))];
            }
        }
        // else {
        //   throw `${normalizePath(
        //     path.relative(process.env.UNI_INPUT_DIR, filename)
        //   )} 编译失败`
        // }
    }
    return result;
}
exports.runKotlinDev = runKotlinDev;
function checkDeps(filename, checkDependencies) {
    const configJsonFile = resolveConfigJsonFile(filename);
    if (configJsonFile && hasDeps(configJsonFile)) {
        return checkDependencies(configJsonFile).then(({ code, msg, data }) => {
            if (code !== 0) {
                console.error(msg);
                return [];
            }
            return data;
        });
    }
    return Promise.resolve([]);
}
function hasDeps(configJsonFile) {
    const deps = (0, shared_2.parseJson)(fs_extra_1.default.readFileSync(configJsonFile, 'utf8')).dependencies || [];
    if ((0, shared_1.isArray)(deps) && deps.length) {
        return true;
    }
    return false;
}
function checkRes(filename, checkRResources) {
    const resDir = resolveResDir(filename);
    if (resDir) {
        return checkRResources(resDir).then(({ code, msg, data }) => {
            if (code !== 0) {
                console.error(msg);
                return [];
            }
            return [data.jarPath];
        });
    }
    return Promise.resolve([]);
}
function resolveResDir(filename) {
    const resDir = path_1.default.resolve((0, utils_1.resolveAndroidDir)(filename), 'res');
    if (fs_extra_1.default.existsSync(resDir)) {
        return resDir;
    }
}
function resolveAndroidResourceClass(filename) {
    const resDir = resolveResDir(filename);
    if (resDir && fs_extra_1.default.readdirSync(resDir).length) {
        const pkg = resolveAndroidManifestPackage(filename);
        if (pkg) {
            return pkg + '.R';
        }
    }
}
const packageRe = /\s+package="(.*)"/;
function resolveAndroidManifestPackage(filename) {
    const manifestXmlPath = path_1.default.resolve((0, utils_1.resolveAndroidDir)(filename), 'AndroidManifest.xml');
    if (fs_extra_1.default.existsSync(manifestXmlPath)) {
        const matches = fs_extra_1.default.readFileSync(manifestXmlPath, 'utf8').match(packageRe);
        if (matches && matches[1]) {
            return matches[1];
        }
    }
}
const deps = ['AndroidManifest.xml', 'config.json'];
function resolveAndroidDepFiles(filename) {
    const dir = (0, utils_1.resolveAndroidDir)(filename);
    return deps.map((dep) => path_1.default.resolve(dir, dep));
}
exports.resolveAndroidDepFiles = resolveAndroidDepFiles;
function resolveConfigJsonFile(filename) {
    const configJsonFile = path_1.default.resolve((0, utils_1.resolveAndroidDir)(filename), 'config.json');
    if (fs_extra_1.default.existsSync(configJsonFile)) {
        return configJsonFile;
    }
}
function resolveSourceMapFile(outputDir, kotlinFile) {
    return (path_1.default.resolve((0, shared_2.resolveSourceMapPath)(), path_1.default.relative(outputDir, kotlinFile)) +
        '.map');
}
const DEFAULT_IMPORTS = [
    'kotlinx.coroutines.async',
    'kotlinx.coroutines.CoroutineScope',
    'kotlinx.coroutines.Deferred',
    'kotlinx.coroutines.Dispatchers',
    'io.dcloud.uts.Map',
    'io.dcloud.uts.*',
];
async function compile(filename, { inputDir, outputDir, sourceMap, components }) {
    const { bundle, UTSTarget } = (0, utils_1.getUTSCompiler)();
    // let time = Date.now()
    const imports = [...DEFAULT_IMPORTS];
    const rClass = resolveAndroidResourceClass(filename);
    if (rClass) {
        imports.push(rClass);
    }
    const componentsCode = (0, utils_1.genComponentsCode)(filename, components);
    const { package: pluginPackage, id: pluginId } = parseKotlinPackage(filename);
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
    const result = await bundle(UTSTarget.KOTLIN, {
        input,
        output: {
            isPlugin: true,
            outDir: outputDir,
            package: pluginPackage,
            sourceMap: sourceMap ? (0, utils_1.resolveUTSSourceMapPath)() : false,
            extname: 'kt',
            imports,
            logFilename: true,
            noColor: !(0, utils_1.isColorSupported)(),
        },
    });
    sourceMap &&
        (0, utils_1.moveRootIndexSourceMap)(filename, {
            inputDir,
            outputDir,
            platform: 'app-android',
            extname: '.kt',
            components,
            package: '',
        });
    return result;
}
exports.compile = compile;
function resolveKotlincArgs(filename, kotlinc, jars) {
    return [
        filename,
        '-cp',
        resolveClassPath(jars),
        '-d',
        resolveJarPath(filename),
        '-kotlin-home',
        kotlinc,
    ];
}
function resolveD8Args(filename) {
    return [
        filename,
        '--no-desugaring',
        '--min-api',
        '19',
        '--output',
        resolveDexPath(filename),
    ];
}
function resolveLibs(filename) {
    const libsPath = path_1.default.resolve((0, utils_1.resolveAndroidDir)(filename), 'libs');
    const libs = [];
    if (fs_extra_1.default.existsSync(libsPath)) {
        libs.push(...(0, fast_glob_1.sync)('*.jar', { cwd: libsPath, absolute: true }));
        const zips = (0, fast_glob_1.sync)('*.aar', { cwd: libsPath });
        zips.forEach((name) => {
            const outputPath = resolveAndroidArchiveOutputPath(name);
            if (!fs_extra_1.default.existsSync(outputPath)) {
                // 解压
                const zip = new adm_zip_1.default(path_1.default.resolve(libsPath, name));
                zip.extractAllTo(outputPath, true);
            }
            libs.push(...(0, fast_glob_1.sync)('**/*.jar', {
                cwd: outputPath,
                absolute: true,
            }));
        });
    }
    return libs;
}
function resolveAndroidArchiveOutputPath(aar) {
    return path_1.default.resolve(process.env.UNI_OUTPUT_DIR, '../.uts/aar', aar ? aar.replace('.aar', '') : '');
}
function resolveDexFile(jarFile) {
    return (0, shared_2.normalizePath)(path_1.default.resolve(path_1.default.dirname(jarFile), 'classes.dex'));
}
function resolveDexPath(filename) {
    return path_1.default.dirname(filename);
}
function resolveJarPath(filename) {
    return filename.replace(path_1.default.extname(filename), '.jar');
}
function resolveClassPath(jars) {
    return jars.join(os_1.default.platform() === 'win32' ? ';' : ':');
}
function checkAndroidVersionTips(pluginId, pluginDir, is_uni_modules) {
    const configJsonFile = (0, path_1.join)(pluginDir, is_uni_modules ? 'utssdk' : '', 'app-android', 'config.json');
    if (configJsonFile && fs_extra_1.default.existsSync(configJsonFile)) {
        try {
            const configJson = (0, shared_2.parseJson)(fs_extra_1.default.readFileSync(configJsonFile, 'utf8'));
            if (configJson.minSdkVersion) {
                const androidVersion = (0, android_versions_1.get)(configJson.minSdkVersion);
                if (androidVersion) {
                    return `uts插件[${pluginId}]需在 Android ${androidVersion.semver} 版本及以上方可正常使用`;
                }
            }
        }
        catch (e) { }
    }
}
exports.checkAndroidVersionTips = checkAndroidVersionTips;
