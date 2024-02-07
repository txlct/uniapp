"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.createBuildOptions = exports.buildOptions = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const entry_1 = require("../plugins/entry");
const debugChunk = (0, debug_1.default)('uni:chunk');
function buildOptions(mp) {
    const platform = process.env.UNI_PLATFORM;
    const inputDir = process.env.UNI_INPUT_DIR;
    const outputDir = process.env.UNI_OUTPUT_DIR;
    // 开始编译时，清空输出目录
    if (fs_1.default.existsSync(outputDir)) {
        (0, uni_cli_shared_1.emptyDir)(outputDir, ['project.config.json', 'project.private.config.json']);
    }
    return createBuildOptions(inputDir, platform, mp);
}
exports.buildOptions = buildOptions;
function createBuildOptions(inputDir, platform, mp) {
    const { renderDynamicImport } = (0, uni_cli_shared_1.dynamicImportPolyfill)();
    return {
        // sourcemap: 'inline', // TODO
        // target: ['chrome53'], // 由小程序自己启用 es6 编译
        emptyOutDir: false,
        lib: {
            // 必须使用 lib 模式，否则会生成 preload 等代码
            fileName: 'app.js',
            entry: (0, uni_cli_shared_1.resolveMainPathOnce)(inputDir),
            formats: ['cjs'],
        },
        rollupOptions: {
            input: parseRollupInput(inputDir, platform),
            output: {
                entryFileNames(chunk) {
                    if (chunk.name === 'main') {
                        return 'app.js';
                    }
                    return chunk.name + '.js';
                },
                format: 'cjs',
                manualChunks: createMoveToVendorChunkFn(mp),
                chunkFileNames: createChunkFileNames(inputDir),
                plugins: [
                    {
                        name: 'dynamic-import-polyfill',
                        renderDynamicImport(options) {
                            const { targetModuleId } = options;
                            if (targetModuleId && (0, uni_cli_shared_1.isMiniProgramAssetFile)(targetModuleId)) {
                                return {
                                    left: 'Promise.resolve(require(',
                                    right: '))',
                                };
                            }
                            return renderDynamicImport.call(this, options);
                        },
                    },
                ],
            },
        },
    };
}
exports.createBuildOptions = createBuildOptions;
function parseRollupInput(inputDir, platform) {
    const inputOptions = {
        app: (0, uni_cli_shared_1.resolveMainPathOnce)(inputDir),
    };
    if (process.env.UNI_MP_PLUGIN) {
        return inputOptions;
    }
    const manifestJson = (0, uni_cli_shared_1.parseManifestJsonOnce)(inputDir);
    const plugins = manifestJson[platform]?.plugins || {};
    Object.keys(plugins).forEach((name) => {
        const pluginExport = plugins[name].export;
        if (!pluginExport) {
            return;
        }
        const pluginExportFile = path_1.default.resolve(inputDir, pluginExport);
        if (!fs_1.default.existsSync(pluginExportFile)) {
            notFound(pluginExportFile);
        }
        inputOptions[(0, uni_cli_shared_1.removeExt)(pluginExport)] = pluginExportFile;
    });
    return inputOptions;
}
function isVueJs(id) {
    return id.includes('\0plugin-vue:export-helper');
}
const chunkFileNameBlackList = ['main', 'pages.json', 'manifest.json'];
const checkIsInList = (list, filename) => (Array.isArray(list) && list.some((item => new RegExp(item).test(filename))));
function createMoveToVendorChunkFn(mp) {
    const cache = new Map();
    const inputDir = (0, uni_cli_shared_1.normalizePath)(process.env.UNI_INPUT_DIR);
    const { vendorConfig = {}, chunk: { include = [], exclude = [], excludeSubPackages = [] } = {} } = mp || {};
    const subPackages = (0, uni_cli_shared_1.parseSubpackagesRootOnce)(process.env.UNI_INPUT_DIR, process.env.UNI_PLATFORM).filter(item => Array.isArray(excludeSubPackages)
        // 过滤excludePackages配置项，不进行处理
        ? !excludeSubPackages.some(exclude => new RegExp(exclude).test(item))
        : item);
    // 是否匹配分包目录
    const isMatchSubPackageRoot = (importers) => {
        if (!subPackages?.length) {
            return null;
        }
        // const importers = files.filter(file => Array.isArray(include)
        //   // 若包含白名单目录则过滤，无需进行检查
        //   ? !include.some(item => new RegExp(item).test(file))
        //   : file
        // );
        // 是否主包
        const isMainPackages = importers.some(importer => 
        // 不在所有的分包配置中
        subPackages.every((sub) => !importer.includes(sub)));
        if (isMainPackages) {
            return null;
        }
        // 是否过滤的包
        const isBlackList = importers.some((importer) => Array.isArray(exclude) && exclude.some(item => new RegExp(item).test(importer)));
        if (isBlackList) {
            console.log("🚀 ~ isMatchSubPackageRoot ~ isExclude : >>>", isBlackList);
            return null;
        }
        // 匹配单一分包才可执行分包js公共逻辑，否则并入common/vendor;
        const match = subPackages.filter((sub) => importers.some((item) => new RegExp(sub).test(item)));
        if (match.length !== 1)
            return null;
        return match[0];
    };
    return (id, { getModuleInfo }) => {
        const normalizedId = (0, uni_cli_shared_1.normalizePath)(id);
        const filename = normalizedId.split('?')[0];
        // 处理资源文件
        if (uni_cli_shared_1.DEFAULT_ASSETS_RE.test(filename)) {
            debugChunk('common/assets', normalizedId);
            return 'common/assets';
        }
        for (const key in vendorConfig) {
            const element = vendorConfig[key];
            if (element.test(filename)) {
                debugChunk(key, normalizedId);
                return key;
            }
        }
        // 处理项目内的js,ts文件
        if (uni_cli_shared_1.EXTNAME_JS_RE.test(filename)) {
            if (filename.startsWith(inputDir) && !filename.includes('node_modules')) {
                const chunkFileName = (0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizePath)(path_1.default.relative(inputDir, filename)));
                if (!chunkFileNameBlackList.includes(chunkFileName) &&
                    !(0, uni_cli_shared_1.hasJsonFile)(chunkFileName) // 无同名的page,component
                ) {
                    debugChunk(chunkFileName, normalizedId);
                    return chunkFileName;
                }
                return;
            }
            const isInclude = checkIsInList(include, filename);
            if (isInclude && subPackages.length) {
                const { importers = [] } = getModuleInfo(id) || {};
                const match = isMatchSubPackageRoot(importers);
                if (match) {
                    console.log("🚀 ~ return ~ match : >>>", match);
                    return `${match}/common/vendor`;
                }
                // 有分包的情况下，放入分包common/vendor中
            }
            // 非项目内的 js 资源，均打包到 vendor
            debugChunk('common/vendor', normalizedId);
            return 'common/vendor';
        }
        if (isVueJs(normalizedId) ||
            (normalizedId.includes('node_modules') &&
                !(0, uni_cli_shared_1.isCSSRequest)(normalizedId) &&
                // 使用原始路径，格式化的可能找不到模块信息 https://github.com/dcloudio/uni-app/issues/3425
                staticImportedByEntry(id, getModuleInfo, cache))) {
            debugChunk('common/vendor', id);
            return 'common/vendor';
        }
    };
}
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    if (importStack.includes(id)) {
        // circular deps!
        cache.set(id, false);
        return false;
    }
    const mod = getModuleInfo(id);
    if (!mod) {
        cache.set(id, false);
        return false;
    }
    if (mod.isEntry) {
        cache.set(id, true);
        return true;
    }
    const someImporterIs = mod.importers.some((importer) => staticImportedByEntry(importer, getModuleInfo, cache, importStack.concat(id)));
    cache.set(id, someImporterIs);
    return someImporterIs;
}
function createChunkFileNames(inputDir) {
    return function chunkFileNames(chunk) {
        if (chunk.isDynamicEntry && chunk.facadeModuleId) {
            let id = chunk.facadeModuleId;
            if ((0, entry_1.isUniPageUrl)(id)) {
                id = path_1.default.resolve(process.env.UNI_INPUT_DIR, (0, entry_1.parseVirtualPagePath)(id));
            }
            else if ((0, entry_1.isUniComponentUrl)(id)) {
                id = path_1.default.resolve(process.env.UNI_INPUT_DIR, (0, entry_1.parseVirtualComponentPath)(id));
            }
            return (0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizeMiniProgramFilename)(id, inputDir)) + '.js';
        }
        // const matchinclude = checkIsinclude(vendorConfig, chunk.facadeModuleId);
        // if (matchinclude) {
        //   const [matchPath = ''] = chunk.facadeModuleId.match(new RegExp(`(?=${matchinclude}).*`, 'gmi')) || [];
        //   if (matchPath) {
        //     console.log("🚀 ~ file: build.ts:282 ~ chunkFileNames ~ matchPath : >>>", matchPath);
        //     return removeExt(matchPath) + '.js';
        //   }
        // }
        return '[name].js';
    };
}
function notFound(filename) {
    console.log();
    console.error(uni_cli_shared_1.M['file.notfound'].replace('{file}', filename));
    console.log();
    process.exit(0);
}
exports.notFound = notFound;
//# sourceMappingURL=build.js.map