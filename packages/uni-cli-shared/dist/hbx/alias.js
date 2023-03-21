"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInstallHBuilderXPluginTips = exports.moduleAliasFormatter = exports.installHBuilderXPlugin = exports.initModuleAlias = void 0;
const path_1 = __importDefault(require("path"));
const module_alias_1 = __importDefault(require("module-alias"));
const resolve_1 = __importDefault(require("resolve"));
const env_1 = require("./env");
const hbxPlugins = {
    // typescript: 'compile-typescript/node_modules/typescript',
    less: 'compile-less/node_modules/less',
    sass: 'compile-dart-sass/node_modules/sass',
    stylus: 'compile-stylus/node_modules/stylus',
    pug: 'compile-pug-cli/node_modules/pug',
};
function initModuleAlias() {
    const compilerSfcPath = require.resolve('@vue/compiler-sfc');
    // const serverRendererPath = require.resolve('@vue/server-renderer')
    module_alias_1.default.addAliases({
        '@vue/shared': require.resolve('@vue/shared'),
        '@vue/shared/dist/shared.esm-bundler.js': require.resolve('@vue/shared/dist/shared.esm-bundler.js'),
        '@vue/compiler-dom': require.resolve('@vue/compiler-dom'),
        '@vue/compiler-sfc': compilerSfcPath,
        // '@vue/server-renderer': serverRendererPath,
        'vue/compiler-sfc': compilerSfcPath,
        // 'vue/server-renderer': serverRendererPath,
    });
    if (process.env.VITEST) {
        module_alias_1.default.addAliases({
            vue: '@dcloudio/uni-h5-vue',
        });
    }
    if ((0, env_1.isInHBuilderX)()) {
        // 又是为了复用 HBuilderX 的插件逻辑，硬编码映射
        Object.keys(hbxPlugins).forEach((name) => {
            module_alias_1.default.addAlias(name, path_1.default.resolve(process.env.UNI_HBUILDERX_PLUGINS, hbxPlugins[name]));
        });
        // https://github.com/vitejs/vite/blob/892916d040a035edde1add93c192e0b0c5c9dd86/packages/vite/src/node/plugins/css.ts#L1481
        const oldSync = resolve_1.default.sync;
        resolve_1.default.sync = (id, opts) => {
            if (hbxPlugins[id]) {
                return path_1.default.resolve(process.env.UNI_HBUILDERX_PLUGINS, hbxPlugins[id]);
            }
            return oldSync(id, opts);
        };
    }
}
exports.initModuleAlias = initModuleAlias;
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
const installPreprocessorTips = {};
exports.moduleAliasFormatter = {
    test(msg) {
        return msg.includes('Preprocessor dependency');
    },
    format(msg) {
        let lang = '';
        let preprocessor = '';
        if (msg.includes(`"sass"`)) {
            lang = 'sass';
            preprocessor = 'compile-dart-sass';
        }
        else if (msg.includes(`"less"`)) {
            lang = 'less';
            preprocessor = 'compile-less';
        }
        else if (msg.includes('"stylus"')) {
            lang = 'stylus';
            preprocessor = 'compile-stylus';
        }
        if (lang) {
            // 仅提醒一次
            if (installPreprocessorTips[lang]) {
                return '';
            }
            installPreprocessorTips[lang] = true;
            installHBuilderXPlugin(preprocessor);
            return formatInstallHBuilderXPluginTips(lang, preprocessor);
        }
        return msg;
    },
};
function formatInstallHBuilderXPluginTips(lang, preprocessor) {
    return `预编译器错误：代码使用了${lang}语言，但未安装相应的编译器插件，${supportAutoInstallPlugin() ? '正在从' : '请前往'}插件市场安装该插件:
https://ext.dcloud.net.cn/plugin?name=${preprocessor}`;
}
exports.formatInstallHBuilderXPluginTips = formatInstallHBuilderXPluginTips;
//# sourceMappingURL=alias.js.map