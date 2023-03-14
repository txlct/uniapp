import { Plugin } from 'vite'
import { ASSETS_INLINE_LIMIT } from '@dcloudio/uni-cli-shared'
import initMiniProgramPlugin from '@dcloudio/uni-mp-vite'
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni'
import { options } from './options'

const uniMiniProgramToutiaoPlugin: Plugin = {
  name: 'uni:mp-toutiao',
  config() {
    return {
      define: {
        __VUE_CREATED_DEFERRED__: true,
      },
      build: {
        assetsInlineLimit: ASSETS_INLINE_LIMIT,
      },
    }
  },
}

export default (opt: VitePluginUniOptions) => {
  return [uniMiniProgramToutiaoPlugin, ...initMiniProgramPlugin(options, opt)]
}
