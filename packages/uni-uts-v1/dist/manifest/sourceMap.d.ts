import { APP_PLATFORM } from './utils';
/**
 * 缓存 sourcemap
 * @param pluginRelativeDir
 * @param outputDir
 * @param cacheDir
 */
export declare function storeSourceMap(platform: APP_PLATFORM, pluginRelativeDir: string, outputDir: string, cacheDir: string, is_uni_modules: boolean): boolean;
/**
 * 拷贝 sourcemap
 * @param pluginRelativeDir
 * @param outputDir
 * @param cacheDir
 */
export declare function restoreSourceMap(platform: APP_PLATFORM, pluginRelativeDir: string, outputDir: string, cacheDir: string, is_uni_modules: boolean): void;
export declare function resolveSourceMapFilename(platform: APP_PLATFORM, pluginRelativeDir: string, outputDir: string, is_uni_modules: boolean): string;
export declare function resolveSourceMapCacheFilename(platform: APP_PLATFORM, cacheDir: string, pluginRelativeDir: string): string;
