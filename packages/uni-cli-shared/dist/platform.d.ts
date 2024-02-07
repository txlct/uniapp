export declare function registerPlatform(platform: string): void;
export declare function getPlatforms(): string[];
export declare function getPlatformDir(): "quickapp-webview-huawei" | "quickapp-webview-union";
export declare function isMiniProgramPlatform(): boolean;
export declare const getPlatformType: () => {
    name: string;
    entryName: string;
    assetsName: string;
    PLATFORM_TYPE: string;
    PREFIX: string;
};
//# sourceMappingURL=platform.d.ts.map