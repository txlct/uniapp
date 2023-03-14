import { APP_PLATFORM } from './manifest/utils';
export declare function isEncrypt(pluginDir: string): boolean;
export declare function compileEncrypt(pluginDir: string): Promise<{
    code: string;
    deps: string[];
    encrypt: boolean;
    meta: {
        commonjs: {
            isCommonJS: boolean;
        };
    };
}>;
export declare function resolveJsCodeCacheFilename(platform: APP_PLATFORM, cacheDir: string, pluginRelativeDir: string): string;
