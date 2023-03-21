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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBuild = exports.runDev = void 0;
const shared_1 = require("@vue/shared");
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const build_1 = require("./build");
const server_1 = require("./server");
const utils_1 = require("./utils");
const easycom_1 = require("../utils/easycom");
async function runDev(options) {
    (0, shared_1.extend)(options, {
        watch: {},
    });
    if (process.env.UNI_MINIMIZE === 'true') {
        ;
        options.minify = true;
    }
    (0, utils_1.initEnv)('dev', options);
    const createLogger = await Promise.resolve().then(() => __importStar(require('vite'))).then(({ createLogger }) => createLogger);
    try {
        if (options.platform === 'h5') {
            const server = await (options.ssr
                ? (0, server_1.createSSRServer)(options)
                : (0, server_1.createServer)(options));
            (0, easycom_1.initEasycom)(server.watcher);
        }
        else {
            const watcher = (await (0, build_1.build)(options));
            (0, easycom_1.initEasycom)();
            let isFirstStart = true;
            let isFirstEnd = true;
            watcher.on('event', (event) => {
                if (event.code === 'BUNDLE_START') {
                    if (isFirstStart) {
                        isFirstStart = false;
                        return;
                    }
                    (0, uni_cli_shared_1.output)('log', uni_cli_shared_1.M['dev.watching.start']);
                }
                else if (event.code === 'BUNDLE_END') {
                    event.result.close();
                    if (isFirstEnd) {
                        // 首次全量同步
                        if (options.platform === 'app') {
                            process.env.UNI_APP_CHANGED_PAGES = '';
                            process.env.UNI_APP_CHANGED_FILES = '';
                            process.env.UNI_APP_UTS_CHANGED_FILES = '';
                        }
                        isFirstEnd = false;
                        (0, uni_cli_shared_1.output)('log', uni_cli_shared_1.M['dev.watching.end']);
                        (0, utils_1.printStartupDuration)(createLogger(options.logLevel), false);
                        if (process.env.UNI_UTS_TIPS) {
                            console.warn(process.env.UNI_UTS_TIPS);
                        }
                        return;
                    }
                    if (options.platform === 'app') {
                        const files = process.env.UNI_APP_CHANGED_FILES;
                        const pages = process.env.UNI_APP_CHANGED_PAGES;
                        const dex = process.env.UNI_APP_UTS_CHANGED_FILES;
                        const changedFiles = pages || files;
                        process.env.UNI_APP_CHANGED_PAGES = '';
                        process.env.UNI_APP_CHANGED_FILES = '';
                        process.env.UNI_APP_UTS_CHANGED_FILES = '';
                        if ((changedFiles &&
                            !changedFiles.includes(uni_cli_shared_1.APP_CONFIG_SERVICE) &&
                            !changedFiles.includes(uni_cli_shared_1.APP_SERVICE_FILENAME)) ||
                            dex) {
                            if (pages) {
                                return (0, uni_cli_shared_1.output)('log', uni_cli_shared_1.M['dev.watching.end.pages'].replace('{pages}', changedFiles));
                            }
                            return (0, uni_cli_shared_1.output)('log', uni_cli_shared_1.M['dev.watching.end.files'].replace('{files}', JSON.stringify(JSON.parse(changedFiles || JSON.stringify([])).concat(JSON.parse(dex || JSON.stringify([]))))));
                        }
                    }
                    return (0, uni_cli_shared_1.output)('log', uni_cli_shared_1.M['dev.watching.end']);
                }
            });
        }
    }
    catch (e) {
        if (options.platform === 'h5') {
            console.error(`error when starting dev server:\n${e.stack || e}`);
        }
        else {
            console.error(`error during build:\n${e.stack || e}`);
        }
        process.exit(1);
    }
}
exports.runDev = runDev;
async function runBuild(options) {
    (0, utils_1.initEnv)('build', options);
    try {
        await (options.ssr && options.platform === 'h5'
            ? (0, build_1.buildSSR)(options)
            : (0, build_1.build)(options));
        console.log(uni_cli_shared_1.M['build.done']);
    }
    catch (e) {
        console.error(`Build failed with errors.`);
        process.exit(1);
    }
}
exports.runBuild = runBuild;
//# sourceMappingURL=action.js.map