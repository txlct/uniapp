"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniEntryPlugin = exports.isUniComponentUrl = exports.isUniPageUrl = exports.parseVirtualComponentPath = exports.parseVirtualPagePath = exports.virtualComponentPath = exports.virtualPagePath = void 0;
const path_1 = __importDefault(require("path"));
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const uniPagePrefix = 'uniPage://';
const uniComponentPrefix = 'uniComponent://';
function virtualPagePath(filepath) {
    return uniPagePrefix + (0, uni_cli_shared_1.encodeBase64Url)(filepath);
}
exports.virtualPagePath = virtualPagePath;
function virtualComponentPath(filepath) {
    return uniComponentPrefix + (0, uni_cli_shared_1.encodeBase64Url)(filepath);
}
exports.virtualComponentPath = virtualComponentPath;
function parseVirtualPagePath(uniPageUrl) {
    return (0, uni_cli_shared_1.decodeBase64Url)(uniPageUrl.replace(uniPagePrefix, ''));
}
exports.parseVirtualPagePath = parseVirtualPagePath;
function parseVirtualComponentPath(uniComponentUrl) {
    return (0, uni_cli_shared_1.decodeBase64Url)(uniComponentUrl.replace(uniComponentPrefix, ''));
}
exports.parseVirtualComponentPath = parseVirtualComponentPath;
function isUniPageUrl(id) {
    return id.startsWith(uniPagePrefix);
}
exports.isUniPageUrl = isUniPageUrl;
function isUniComponentUrl(id) {
    return id.startsWith(uniComponentPrefix);
}
exports.isUniComponentUrl = isUniComponentUrl;
function uniEntryPlugin({ global, }) {
    const inputDir = process.env.UNI_INPUT_DIR;
    return {
        name: 'uni:virtual',
        enforce: 'pre',
        resolveId(id) {
            if (isUniPageUrl(id) || isUniComponentUrl(id)) {
                return id;
            }
        },
        load(id) {
            if (isUniPageUrl(id)) {
                const filepath = (0, uni_cli_shared_1.normalizePath)(path_1.default.resolve(inputDir, parseVirtualPagePath(id)));
                this.addWatchFile(filepath);
                return {
                    code: `import MiniProgramPage from '${filepath}'
${global}.createPage(MiniProgramPage)`,
                };
            }
            else if (isUniComponentUrl(id)) {
                const filepath = (0, uni_cli_shared_1.normalizePath)(path_1.default.resolve(inputDir, parseVirtualComponentPath(id)));
                this.addWatchFile(filepath);
                (0, uni_cli_shared_1.addMiniProgramComponentJson)((0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizeMiniProgramFilename)(filepath, inputDir)), { component: true });
                return {
                    code: `import Component from '${filepath}'
${global}.createComponent(Component)`,
                };
            }
        },
    };
}
exports.uniEntryPlugin = uniEntryPlugin;
//# sourceMappingURL=entry.js.map