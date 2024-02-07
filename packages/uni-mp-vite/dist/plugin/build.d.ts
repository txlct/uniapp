import type { BuildOptions, UserConfig } from 'vite';
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni';
export declare function buildOptions(mp: Required<VitePluginUniOptions>['mp']): UserConfig['build'];
export declare function createBuildOptions(inputDir: string, platform: UniApp.PLATFORM, mp: Required<VitePluginUniOptions>['mp']): BuildOptions;
export declare function notFound(filename: string): never;
