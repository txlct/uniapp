"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const css_1 = require("./css");
const resolve_1 = require("./resolve");
const build_1 = require("./build");
const optimizeDeps_1 = require("./optimizeDeps");
const define_1 = require("./define");
function createConfig(options, _uniPlugins) {
    return (config, env) => {
        options.command = env.command;
        let base = config.base;
        if (!base) {
            const { h5 } = (0, uni_cli_shared_1.parseManifestJsonOnce)(options.inputDir);
            base = (h5 && h5.router && h5.router.base) || '';
        }
        if (!base) {
            base = '/';
        }
        options.base = base;
        return {
            base: process.env.UNI_H5_BASE || base,
            root: process.env.VITE_ROOT_DIR,
            // TODO 临时设置为__static__,屏蔽警告：https://github.com/vitejs/vite/blob/824d042535033a5c3d7006978c0d05c201cd1c25/packages/vite/src/node/server/middlewares/transform.ts#L125
            publicDir: config.publicDir || '__static__',
            define: (0, define_1.createDefine)(options),
            resolve: (0, resolve_1.createResolve)(options, config),
            logLevel: config.logLevel || 'warn',
            optimizeDeps: (0, optimizeDeps_1.createOptimizeDeps)(options),
            build: (0, build_1.createBuild)(options, config),
            css: (0, css_1.createCss)(options, config),
            esbuild: {
                include: /\.(tsx?|jsx|uts)$/,
                exclude: /\.js$/,
                loader: 'ts',
            },
        };
    };
}
exports.createConfig = createConfig;
//# sourceMappingURL=index.js.map