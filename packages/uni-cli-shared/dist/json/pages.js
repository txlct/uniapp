"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSubpackagesRootOnce = exports.normalizePagesRoute = exports.removePlatformStyle = exports.validatePages = exports.normalizePagesJson = exports.parsePagesJsonOnce = exports.parsePagesJson = exports.isUniPageSfcFile = exports.isUniPageSetupAndTs = exports.isUniPageFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@vue/shared");
const uni_shared_1 = require("@dcloudio/uni-shared");
const utils_1 = require("../utils");
const json_1 = require("./json");
const utils_2 = require("../vue/utils");
const vite_1 = require("../vite");
const constants_1 = require("../constants");
const theme_1 = require("./theme");
const manifest_1 = require("./manifest");
const pagesCacheSet = new Set();
function isUniPageFile(file, inputDir = process.env.UNI_INPUT_DIR) {
    if (inputDir && path_1.default.isAbsolute(file)) {
        file = (0, utils_1.normalizePath)(path_1.default.relative(inputDir, file));
    }
    return pagesCacheSet.has((0, utils_1.removeExt)(file));
}
exports.isUniPageFile = isUniPageFile;
function isUniPageSetupAndTs(file) {
    const { filename, query } = (0, vite_1.parseVueRequest)(file);
    return !!(query.vue &&
        query.setup &&
        (0, shared_1.hasOwn)(query, 'lang.ts') &&
        constants_1.EXTNAME_VUE_RE.test(filename));
}
exports.isUniPageSetupAndTs = isUniPageSetupAndTs;
function isUniPageSfcFile(file, inputDir = process.env.UNI_INPUT_DIR) {
    return (0, utils_2.isVueSfcFile)(file) && isUniPageFile(file, inputDir);
}
exports.isUniPageSfcFile = isUniPageSfcFile;
/**
 * 小程序平台慎用，因为该解析不支持 subpackages
 * @param inputDir
 * @param platform
 * @param normalize
 * @returns
 */
const parsePagesJson = (inputDir, platform, normalize = true) => {
    const jsonStr = fs_1.default.readFileSync(path_1.default.join(inputDir, 'pages.json'), 'utf8');
    if (normalize) {
        return normalizePagesJson(jsonStr, platform);
    }
    return (0, json_1.parseJson)(jsonStr, true);
};
exports.parsePagesJson = parsePagesJson;
/**
 * 该方法解析出来的是不支持 subpackages，会被合并入 pages
 */
exports.parsePagesJsonOnce = (0, uni_shared_1.once)(exports.parsePagesJson);
/**
 * 目前 App 和 H5 使用了该方法
 * @param jsonStr
 * @param platform
 * @param param2
 * @returns
 */
function normalizePagesJson(jsonStr, platform, { subpackages, } = { subpackages: false }) {
    let pagesJson = {
        pages: [],
        globalStyle: {
            navigationBar: {},
        },
    };
    // preprocess
    try {
        pagesJson = (0, json_1.parseJson)(jsonStr, true);
    }
    catch (e) {
        console.error(`[vite] Error: pages.json parse failed.\n`, jsonStr, e);
    }
    // pages
    validatePages(pagesJson, jsonStr);
    pagesJson.subPackages = pagesJson.subPackages || pagesJson.subpackages;
    delete pagesJson.subpackages;
    // subpackages
    if (pagesJson.subPackages) {
        if (subpackages) {
            pagesJson.subPackages.forEach(({ pages }) => {
                pages && normalizePages(pages, platform);
            });
        }
        else {
            pagesJson.pages.push(...normalizeSubpackages(pagesJson.subPackages));
            delete pagesJson.subPackages;
        }
    }
    else {
        delete pagesJson.subPackages;
    }
    // pageStyle
    normalizePages(pagesJson.pages, platform);
    // globalStyle
    pagesJson.globalStyle = normalizePageStyle(null, pagesJson.globalStyle, platform);
    // tabBar
    if (pagesJson.tabBar) {
        const tabBar = normalizeTabBar(pagesJson.tabBar, platform);
        if (tabBar) {
            pagesJson.tabBar = tabBar;
        }
        else {
            delete pagesJson.tabBar;
        }
    }
    // 缓存页面列表
    pagesCacheSet.clear();
    pagesJson.pages.forEach((page) => pagesCacheSet.add(page.path));
    const manifestJsonPlatform = (0, manifest_1.getPlatformManifestJsonOnce)();
    if (!manifestJsonPlatform.darkmode) {
        const { pages, globalStyle, tabBar } = (0, theme_1.initTheme)(manifestJsonPlatform, pagesJson);
        (0, shared_1.extend)(pagesJson, { pages, globalStyle, tabBar });
    }
    return pagesJson;
}
exports.normalizePagesJson = normalizePagesJson;
function validatePages(pagesJson, jsonStr) {
    if (!(0, shared_1.isArray)(pagesJson.pages)) {
        pagesJson.pages = [];
        throw new Error(`[uni-app] Error: pages.json->pages parse failed.`);
    }
    else if (!pagesJson.pages.length) {
        throw new Error(`[uni-app] Error: pages.json->pages must contain at least 1 page.`);
    }
}
exports.validatePages = validatePages;
function normalizePages(pages, platform) {
    pages.forEach((page) => {
        page.style = normalizePageStyle(page.path, page.style, platform);
    });
    if (platform !== 'app') {
        return;
    }
    const subNVuePages = [];
    // subNVues
    pages.forEach(({ style: { subNVues } }) => {
        if (!(0, shared_1.isArray)(subNVues)) {
            return;
        }
        subNVues.forEach((subNVue) => {
            if (subNVue && subNVue.path) {
                subNVuePages.push({
                    path: subNVue.path,
                    style: { isSubNVue: true, isNVue: true, navigationBar: {} },
                });
            }
        });
    });
    if (subNVuePages.length) {
        pages.push(...subNVuePages);
    }
}
function normalizeSubpackages(subpackages) {
    const pages = [];
    if ((0, shared_1.isArray)(subpackages)) {
        subpackages.forEach(({ root, pages: subPages }) => {
            if (root && subPages.length) {
                subPages.forEach((subPage) => {
                    subPage.path = (0, utils_1.normalizePath)(path_1.default.join(root, subPage.path));
                    subPage.style = normalizeSubpackageSubNVues(root, subPage.style);
                    pages.push(subPage);
                });
            }
        });
    }
    return pages;
}
function normalizeSubpackageSubNVues(root, style = { navigationBar: {} }) {
    const platformStyle = style['app'] || style['app-plus'];
    if (!platformStyle) {
        return style;
    }
    if ((0, shared_1.isArray)(platformStyle.subNVues)) {
        platformStyle.subNVues.forEach((subNVue) => {
            if (subNVue.path) {
                subNVue.path = (0, utils_1.normalizePath)(path_1.default.join(root, subNVue.path));
            }
        });
    }
    return style;
}
function normalizePageStyle(pagePath, pageStyle, platform) {
    const hasNVue = pagePath &&
        process.env.UNI_INPUT_DIR &&
        fs_1.default.existsSync(path_1.default.join(process.env.UNI_INPUT_DIR, pagePath + '.nvue'))
        ? true
        : undefined;
    let isNVue = false;
    if (hasNVue) {
        const hasVue = fs_1.default.existsSync(path_1.default.join(process.env.UNI_INPUT_DIR, pagePath + '.vue'));
        if (hasVue) {
            if (platform === 'app') {
                if (process.env.UNI_NVUE_COMPILER !== 'vue') {
                    isNVue = true;
                }
            }
        }
        else {
            isNVue = true;
        }
    }
    if (pageStyle) {
        if (platform === 'h5') {
            (0, shared_1.extend)(pageStyle, pageStyle['app'] || pageStyle['app-plus']);
        }
        if (platform === 'app') {
            (0, shared_1.extend)(pageStyle, pageStyle['app'] || pageStyle['app-plus']);
        }
        else {
            (0, shared_1.extend)(pageStyle, pageStyle[platform]);
        }
        if (['h5', 'app'].includes(platform)) {
            pageStyle.navigationBar = normalizeNavigationBar(pageStyle);
            if (isEnablePullDownRefresh(pageStyle)) {
                pageStyle.enablePullDownRefresh = true;
                pageStyle.pullToRefresh = normalizePullToRefresh(pageStyle);
            }
            if (platform === 'app') {
                pageStyle.disableSwipeBack === true
                    ? (pageStyle.popGesture = 'none')
                    : delete pageStyle.popGesture;
                delete pageStyle.disableSwipeBack;
            }
        }
        pageStyle.isNVue = isNVue;
        removePlatformStyle(pageStyle);
        return pageStyle;
    }
    return { navigationBar: {}, isNVue };
}
const navigationBarMaps = {
    navigationBarBackgroundColor: 'backgroundColor',
    navigationBarTextStyle: 'textStyle',
    navigationBarTitleText: 'titleText',
    navigationStyle: 'style',
    titleImage: 'titleImage',
    titlePenetrate: 'titlePenetrate',
    transparentTitle: 'transparentTitle',
};
function normalizeNavigationBar(pageStyle) {
    const navigationBar = Object.create(null);
    Object.keys(navigationBarMaps).forEach((name) => {
        if ((0, shared_1.hasOwn)(pageStyle, name)) {
            navigationBar[navigationBarMaps[name]] =
                pageStyle[name];
            delete pageStyle[name];
        }
    });
    navigationBar.type = navigationBar.type || 'default';
    const { titleNView } = pageStyle;
    if ((0, shared_1.isPlainObject)(titleNView)) {
        (0, shared_1.extend)(navigationBar, titleNView);
        delete pageStyle.titleNView;
    }
    else if (titleNView === false) {
        navigationBar.style = 'custom';
    }
    if ((0, shared_1.hasOwn)(navigationBar, 'transparentTitle')) {
        const transparentTitle = navigationBar.transparentTitle;
        if (transparentTitle === 'always') {
            navigationBar.style = 'custom';
            navigationBar.type = 'float';
        }
        else if (transparentTitle === 'auto') {
            navigationBar.type = 'transparent';
        }
        else {
            navigationBar.type = 'default';
        }
        delete navigationBar.transparentTitle;
    }
    if (navigationBar.titleImage && navigationBar.titleText) {
        delete navigationBar.titleText;
    }
    if (!navigationBar.titleColor && (0, shared_1.hasOwn)(navigationBar, 'textStyle')) {
        const textStyle = navigationBar.textStyle;
        if (constants_1.TEXT_STYLE.includes(textStyle)) {
            navigationBar.titleColor = (0, uni_shared_1.normalizeTitleColor)(textStyle);
        }
        else {
            navigationBar.titleColor = navigationBar.textStyle;
        }
        delete navigationBar.textStyle;
    }
    if (pageStyle.navigationBarShadow &&
        pageStyle.navigationBarShadow.colorType) {
        navigationBar.shadowColorType = pageStyle.navigationBarShadow.colorType;
        delete pageStyle.navigationBarShadow;
    }
    const parsedNavigationBar = (0, theme_1.initTheme)((0, manifest_1.getPlatformManifestJsonOnce)(), navigationBar);
    if ((0, shared_1.isArray)(navigationBar.buttons)) {
        navigationBar.buttons = navigationBar.buttons.map((btn) => normalizeNavigationBarButton(btn, navigationBar.type, parsedNavigationBar.titleColor));
    }
    if ((0, shared_1.isPlainObject)(navigationBar.searchInput)) {
        navigationBar.searchInput = normalizeNavigationBarSearchInput(navigationBar.searchInput);
    }
    if (navigationBar.type === 'transparent') {
        navigationBar.coverage = navigationBar.coverage || '132px';
    }
    return navigationBar;
}
function normalizeNavigationBarButton(btn, type, titleColor) {
    btn.color = btn.color || titleColor;
    if (!btn.fontSize) {
        btn.fontSize =
            type === 'transparent' || (btn.text && /\\u/.test(btn.text))
                ? '22px'
                : '27px';
    }
    else if (/\d$/.test(btn.fontSize)) {
        btn.fontSize += 'px';
    }
    btn.text = btn.text || '';
    return btn;
}
function normalizeNavigationBarSearchInput(searchInput) {
    return (0, shared_1.extend)({
        autoFocus: false,
        align: 'center',
        color: '#000',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: '0px',
        placeholder: '',
        placeholderColor: '#CCCCCC',
        disabled: false,
    }, searchInput);
}
const DEFAULT_TAB_BAR = {
    position: 'bottom',
    color: '#999',
    selectedColor: '#007aff',
    borderStyle: 'black',
    blurEffect: 'none',
    fontSize: '10px',
    iconWidth: '24px',
    spacing: '3px',
    height: uni_shared_1.TABBAR_HEIGHT + 'px',
};
function normalizeTabBar(tabBar, platform) {
    const { list, midButton } = tabBar;
    if (!list || !list.length) {
        return;
    }
    tabBar = (0, shared_1.extend)({}, DEFAULT_TAB_BAR, tabBar);
    list.forEach((item) => {
        if (item.iconPath) {
            item.iconPath = normalizeFilepath(item.iconPath);
        }
        if (item.selectedIconPath) {
            item.selectedIconPath = normalizeFilepath(item.selectedIconPath);
        }
    });
    if (midButton && midButton.backgroundImage) {
        midButton.backgroundImage = normalizeFilepath(midButton.backgroundImage);
    }
    tabBar.selectedIndex = 0;
    tabBar.shown = true;
    return tabBar;
}
const SCHEME_RE = /^([a-z-]+:)?\/\//i;
const DATA_RE = /^data:.*,.*/;
function normalizeFilepath(filepath) {
    const themeConfig = (0, theme_1.normalizeThemeConfigOnce)()['light'] || {};
    if (themeConfig[filepath.replace('@', '')])
        return filepath;
    if (!(SCHEME_RE.test(filepath) || DATA_RE.test(filepath)) &&
        filepath.indexOf('/') !== 0) {
        return (0, uni_shared_1.addLeadingSlash)(filepath);
    }
    return filepath;
}
const platforms = ['h5', 'app', 'mp-', 'quickapp'];
function removePlatformStyle(pageStyle) {
    Object.keys(pageStyle).forEach((name) => {
        if (platforms.find((prefix) => name.startsWith(prefix))) {
            delete pageStyle[name];
        }
    });
    return pageStyle;
}
exports.removePlatformStyle = removePlatformStyle;
function normalizePagesRoute(pagesJson) {
    const firstPagePath = pagesJson.pages[0].path;
    const tabBarList = (pagesJson.tabBar && pagesJson.tabBar.list) || [];
    return pagesJson.pages.map((pageOptions) => {
        const pagePath = pageOptions.path;
        const isEntry = firstPagePath === pagePath ? true : undefined;
        const tabBarIndex = tabBarList.findIndex((tabBarPage) => tabBarPage.pagePath === pagePath);
        const isTabBar = tabBarIndex !== -1 ? true : undefined;
        let windowTop = 0;
        const meta = (0, shared_1.extend)({
            isQuit: isEntry || isTabBar ? true : undefined,
            isEntry: isEntry || undefined,
            isTabBar: isTabBar || undefined,
            tabBarIndex: isTabBar ? tabBarIndex : undefined,
            windowTop: windowTop || undefined,
        }, pageOptions.style);
        return {
            path: pageOptions.path,
            meta,
        };
    });
}
exports.normalizePagesRoute = normalizePagesRoute;
function isEnablePullDownRefresh(pageStyle) {
    return pageStyle.enablePullDownRefresh || pageStyle.pullToRefresh?.support;
}
function normalizePullToRefresh(pageStyle) {
    return pageStyle.pullToRefresh;
}
function parseSubpackagesRoot(inputDir, platform) {
    const pagesJson = (0, exports.parsePagesJson)(inputDir, platform, false);
    const subpackages = pagesJson.subPackages || pagesJson.subpackages;
    const roots = [];
    if ((0, shared_1.isArray)(subpackages)) {
        subpackages.forEach(({ root }) => {
            if (root) {
                roots.push(root);
            }
        });
    }
    return roots;
}
exports.parseSubpackagesRootOnce = (0, uni_shared_1.once)(parseSubpackagesRoot);
//# sourceMappingURL=pages.js.map