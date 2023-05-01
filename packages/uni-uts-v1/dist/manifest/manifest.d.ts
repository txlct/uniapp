import { APP_PLATFORM } from './utils';
interface ManifestFile {
    md5: string;
}
declare const VERSION = "1";
export interface Manifest {
    version: typeof VERSION;
    env: Record<string, unknown>;
    files: {
        [file: string]: ManifestFile;
    };
}
/**
 * 计算文件 md5（有缓存）
 * @param file
 * @returns
 */
export declare function hash(file: string): Promise<string>;
interface GenManifestJsonOptions {
    pluginDir: string;
    env: Record<string, unknown>;
    files?: string[];
    is_uni_modules: boolean;
}
export interface GenManifestFileOptions {
    cacheDir: string;
    pluginRelativeDir: string;
    is_uni_modules: boolean;
    env: Record<string, unknown>;
    pluginDir: string;
    files?: string[];
}
export declare function genManifestFile(platform: APP_PLATFORM, { files, pluginDir, env, cacheDir, pluginRelativeDir, is_uni_modules, }: GenManifestFileOptions): Promise<boolean>;
export declare function genManifestJson(platform: APP_PLATFORM, { pluginDir, files, env, is_uni_modules }: GenManifestJsonOptions): Promise<Manifest>;
export declare function resolvePluginFiles(platform: APP_PLATFORM, pluginDir: string, is_uni_modules: boolean): Promise<string[]>;
export declare function checkManifest(manifest: Manifest, { env, files, pluginDir, }: {
    pluginDir: string;
    files: string[];
    env: Record<string, unknown>;
}): Promise<string | boolean>;
export declare function hasCustomResources(files: string[], resources: string[]): true | undefined;
export declare function isCustomResources(file: string, resources: string[]): boolean;
export declare function resolveManifestJson(platform: APP_PLATFORM, pluginRelativeDir: string, cacheDir: string): Manifest | undefined;
export {};
