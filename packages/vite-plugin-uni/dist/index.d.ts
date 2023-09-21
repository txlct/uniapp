import type { Plugin } from 'vite';
import type { VitePluginUniResolvedOptions, VitePluginUniOptions, ViteLegacyOptions } from '@dcloudio/uni-cli-shared';
export type { ViteLegacyOptions, VitePluginUniOptions, VitePluginUniResolvedOptions };
export { runDev, runBuild } from './cli/action';
export default function uniPlugin(rawOptions?: VitePluginUniOptions): Plugin[];
