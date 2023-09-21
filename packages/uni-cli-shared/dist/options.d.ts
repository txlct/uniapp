import type { Options as VueOptions } from '@vitejs/plugin-vue';
import type { VueJSXPluginOptions } from '@vue/babel-plugin-jsx';
import type ViteLegacyPlugin from '@vitejs/plugin-legacy';
import type { ResolvedConfig, ViteDevServer, BuildOptions } from 'vite';
import { CopyOptions } from './vite';
export type ViteLegacyOptions = Parameters<typeof ViteLegacyPlugin>[0];
export interface VitePluginUniOptions {
    vueOptions?: VueOptions;
    vueJsxOptions?: (VueJSXPluginOptions & {
        babelPlugins?: any[];
    }) | boolean;
    viteLegacyOptions?: ViteLegacyOptions | false;
    mp?: {
        vendorConfig: Record<string, RegExp>;
    };
    h5?: {
        rollupOptions: BuildOptions['rollupOptions'];
        commonChunk?: string[];
    };
}
export interface VitePluginUniResolvedOptions extends VitePluginUniOptions {
    base: string;
    command: ResolvedConfig['command'];
    platform: UniApp.PLATFORM;
    inputDir: string;
    outputDir: string;
    assetsDir: string;
    devServer?: ViteDevServer;
    copyOptions?: Required<CopyOptions>;
}
