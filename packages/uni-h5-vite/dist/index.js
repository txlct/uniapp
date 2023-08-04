"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const plugin_1 = require("./plugin");
const css_1 = require("./plugins/css");
const easycom_1 = require("./plugins/easycom");
const inject_1 = require("./plugins/inject");
const mainJs_1 = require("./plugins/mainJs");
const manifestJson_1 = require("./plugins/manifestJson");
const pagesJson_1 = require("./plugins/pagesJson");
const postVue_1 = require("./plugins/postVue");
const renderjs_1 = require("./plugins/renderjs");
const resolveId_1 = require("./plugins/resolveId");
const setup_1 = require("./plugins/setup");
const ssr_1 = require("./plugins/ssr");
const mainJsCustomize_1 = require("./plugins/mainJsCustomize");
const manifestJsonCustomize_1 = require("./plugins/manifestJsonCustomize");
const pagesJsonCustomize_1 = require("./plugins/pagesJsonCustomize");
exports.default = (options) => {
    const vitrualTsPlugins = options.h5?.split ?
        [
            (0, mainJsCustomize_1.uniMainJsCustomizePlugin)(options),
            (0, manifestJsonCustomize_1.uniManifestJsonCustomizePlugin)(options),
            (0, pagesJsonCustomize_1.uniPagesJsonCustomizePlugin)(options)
        ] : [
        (0, mainJs_1.uniMainJsPlugin)(),
        (0, manifestJson_1.uniManifestJsonPlugin)(),
        (0, pagesJson_1.uniPagesJsonPlugin)()
    ];
    return [
        (0, easycom_1.uniEasycomPlugin)({ exclude: uni_cli_shared_1.UNI_EASYCOM_EXCLUDE }),
        (0, uni_cli_shared_1.uniCssScopedPlugin)({
            filter: (id) => (0, uni_cli_shared_1.isVueSfcFile)(id) && !id.endsWith('App.vue'),
        }),
        (0, resolveId_1.uniResolveIdPlugin)(),
        ...vitrualTsPlugins,
        (0, inject_1.uniInjectPlugin)(),
        (0, css_1.uniCssPlugin)(),
        (0, ssr_1.uniSSRPlugin)(),
        (0, setup_1.uniSetupPlugin)(),
        (0, renderjs_1.uniRenderjsPlugin)(),
        (0, plugin_1.uniH5Plugin)(options),
        (0, postVue_1.uniPostVuePlugin)(),
    ];
};
//# sourceMappingURL=index.js.map