import type { Plugin, ResolvedConfig } from 'vite';
import type { VitePluginUniResolvedOptions } from '@dcloudio/uni-cli-shared';
export declare function createConfig(options: {
    resolvedConfig: ResolvedConfig | null;
}, uniOption: VitePluginUniResolvedOptions): Plugin['config'];
