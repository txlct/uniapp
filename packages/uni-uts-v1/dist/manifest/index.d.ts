import { APP_PLATFORM, CheckOptions, CheckResult } from './utils';
export { genManifestFile } from './manifest';
export { restoreDex, storeDex } from './dex';
export { restoreSourceMap, storeSourceMap } from './sourceMap';
export declare function checkKotlinCompile(playground: typeof process.env.HX_USE_BASE_TYPE, options: CheckOptions): Promise<CheckResult>;
export declare function checkSwiftCompile(playground: typeof process.env.HX_USE_BASE_TYPE, options: CheckOptions): Promise<CheckResult>;
export declare function checkCompile(platform: APP_PLATFORM, playground: typeof process.env.HX_USE_BASE_TYPE, options: CheckOptions): Promise<CheckResult>;
export declare function initCheckOptionsEnv(): CheckOptions['env'];
