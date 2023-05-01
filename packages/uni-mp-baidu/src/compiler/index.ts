import type { Plugin } from 'vite'
import initMiniProgramPlugin from '@dcloudio/uni-mp-vite'
import { options } from './options'
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni'

const uniMiniProgramBaiduPlugin: Plugin = {
  name: 'uni:mp-baidu',
  config() {
    return {
      define: {
        __VUE_CREATED_DEFERRED__: false,
      },
    }
  },
}
export default (opt: VitePluginUniOptions) => [
  uniMiniProgramBaiduPlugin,
  ...initMiniProgramPlugin(options, opt),
]
