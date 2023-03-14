import type { Plugin } from 'vite'
import initMiniProgramPlugin from '@dcloudio/uni-mp-vite'

import {
  ASSETS_INLINE_LIMIT,
  copyMiniProgramThemeJson,
} from '@dcloudio/uni-cli-shared'
import { options } from '@dcloudio/uni-mp-toutiao/src/compiler/options'
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni'
const uniMiniProgramToutiaoPlugin: Plugin = {
  name: 'uni:mp-lark',
  config() {
    return {
      define: {
        __VUE_CREATED_DEFERRED__: true,
      },
      build: {
        // css 中不支持引用本地资源
        assetsInlineLimit: ASSETS_INLINE_LIMIT,
      },
    }
  },
}

options.vite.copyOptions.targets = [
  ...(options.vite.copyOptions.targets || []),
  ...copyMiniProgramThemeJson(),
]

options.app.darkmode = true

options.cdn = 10

options.template.slot.fallbackContent = false
// 飞书不支持：
// <view tt:for="{{items}}" tt:for-item="item" tt:key="id" slot="{{item.slot}}">{{item.text}}</view>
options.template.slot.dynamicSlotNames = false
options.project!.config = ['project.lark.json']
export default (opt: VitePluginUniOptions) => [
  uniMiniProgramToutiaoPlugin,
  ...initMiniProgramPlugin(options, opt),
]
