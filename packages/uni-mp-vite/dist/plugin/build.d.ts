import { BuildOptions, UserConfig } from 'vite';
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni';
export declare function buildOptions(vendorConfig: Required<VitePluginUniOptions>['mp']['vendorConfig']): UserConfig['build'];
export declare function createBuildOptions(inputDir: string, platform: UniApp.PLATFORM, vendorConfig: Required<VitePluginUniOptions>['mp']['vendorConfig']): BuildOptions;
export declare function notFound(filename: string): never;