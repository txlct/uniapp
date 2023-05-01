import type { Plugin } from 'vite'
import { ASSETS_INLINE_LIMIT } from '@dcloudio/uni-cli-shared'
import initMiniProgramPlugin from '@dcloudio/uni-mp-vite'
import { options } from './options'
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni'

const uniMiniProgramWeixinPlugin: Plugin = {
  name: 'uni:mp-weixin',
  config() {
    return {
      define: {
        __VUE_CREATED_DEFERRED__: false,
      },
      build: {
        // css 中不支持引用本地资源
        assetsInlineLimit: ASSETS_INLINE_LIMIT,
      },
    }
  },
}

export default (opt: VitePluginUniOptions) => {
  return [uniMiniProgramWeixinPlugin, ...initMiniProgramPlugin(options, opt)]
}
