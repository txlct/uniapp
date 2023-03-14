export declare const enum FORMATS {
    ES = "es",
    CJS = "cjs"
}
interface GenProxyCodeOptions {
    is_uni_modules: boolean;
    id: string;
    name: string;
    extname: string;
    namespace: string;
    androidComponents?: Record<string, string>;
    iosComponents?: Record<string, string>;
    format?: FORMATS;
    pluginRelativeDir?: string;
    moduleName?: string;
    moduleType?: string;
}
export declare function genProxyCode(module: string, options: GenProxyCodeOptions): Promise<string>;
export declare function genComponentsCode(format: FORMATS | undefined, androidComponents: Record<string, string>, iosComponents: Record<string, string>): string;
export declare function resolveRootIndex(module: string, options: GenProxyCodeOptions): string | false;
export declare function resolvePlatformIndexFilename(platform: 'app-android' | 'app-ios', module: string, options: GenProxyCodeOptions): string;
export declare function resolvePlatformIndex(platform: 'app-android' | 'app-ios', module: string, options: GenProxyCodeOptions): string | false;
export {};
