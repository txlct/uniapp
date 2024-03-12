import type { BuildOptions, UserConfig } from 'vite';
import { VitePluginUniOptions } from '@dcloudio/uni-cli-shared';
export declare function buildOptions(mp: Required<VitePluginUniOptions>['mp']): UserConfig['build'];
export declare function createBuildOptions(inputDir: string, platform: UniApp.PLATFORM, mp: Required<VitePluginUniOptions>['mp']): BuildOptions;
export declare function notFound(filename: string): never;
