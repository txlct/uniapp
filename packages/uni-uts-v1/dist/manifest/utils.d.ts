export type APP_PLATFORM = 'app-android' | 'app-ios';
export interface CheckOptions {
    id: string;
    env: Record<string, unknown>;
    pluginDir: string;
    pluginRelativeDir: string;
    cacheDir: string;
    outputDir: string;
    is_uni_modules: boolean;
}
export interface CheckResult {
    expired: boolean;
    tips?: string;
    files: string[];
}
export declare function customResourceTips(id: string): string;
export declare function customResourceChangedTips(id: string): string;
export declare function cacheTips(id: string): string;
