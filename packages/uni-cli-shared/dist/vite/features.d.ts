import type { ConfigEnv } from 'vite';
export type FEATURE_DEFINES = ReturnType<typeof initFeatures>;
interface InitFeaturesOptions {
    pagesJson: UniApp.PagesJson;
    manifestJson: any;
    inputDir: string;
    platform: UniApp.PLATFORM;
    command: ConfigEnv['command'];
    ssr: boolean;
}
export declare function initFeatures(options: InitFeaturesOptions): {
    __VUE_OPTIONS_API__: boolean;
    __VUE_PROD_DEVTOOLS__: boolean;
    __UNI_FEATURE_WX__: boolean;
    __UNI_FEATURE_WXS__: boolean;
    __UNI_FEATURE_RPX__: boolean;
    __UNI_FEATURE_PROMISE__: boolean;
    __UNI_FEATURE_LONGPRESS__: boolean;
    __UNI_FEATURE_I18N_EN__: boolean;
    __UNI_FEATURE_I18N_ES__: boolean;
    __UNI_FEATURE_I18N_FR__: boolean;
    __UNI_FEATURE_I18N_ZH_HANS__: boolean;
    __UNI_FEATURE_I18N_ZH_HANT__: boolean;
    __UNI_FEATURE_UNI_CLOUD__: boolean;
    __UNI_FEATURE_I18N_LOCALE__: boolean;
    __UNI_FEATURE_NVUE__: boolean;
    __UNI_FEATURE_ROUTER_MODE__: "\"hash\"" | "\"history\"";
    __UNI_FEATURE_PAGES__: boolean;
    __UNI_FEATURE_TABBAR__: boolean;
    __UNI_FEATURE_TABBAR_MIDBUTTON__: boolean;
    __UNI_FEATURE_TOPWINDOW__: boolean;
    __UNI_FEATURE_LEFTWINDOW__: boolean;
    __UNI_FEATURE_RIGHTWINDOW__: boolean;
    __UNI_FEATURE_RESPONSIVE__: boolean;
    __UNI_FEATURE_NAVIGATIONBAR__: boolean;
    __UNI_FEATURE_PULL_DOWN_REFRESH__: boolean;
    __UNI_FEATURE_NAVIGATIONBAR_BUTTONS__: boolean;
    __UNI_FEATURE_NAVIGATIONBAR_SEARCHINPUT__: boolean;
    __UNI_FEATURE_NAVIGATIONBAR_TRANSPARENT__: boolean;
};
export {};
//# sourceMappingURL=features.d.ts.map