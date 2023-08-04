import {
  isVueSfcFile,
  uniCssScopedPlugin,
  UNI_EASYCOM_EXCLUDE,
} from '@dcloudio/uni-cli-shared'
import { uniH5Plugin } from './plugin'
import { uniCssPlugin } from './plugins/css'
import { uniEasycomPlugin } from './plugins/easycom'
import { uniInjectPlugin } from './plugins/inject'
import { uniMainJsPlugin } from './plugins/mainJs'
import { uniManifestJsonPlugin } from './plugins/manifestJson'
import { uniPagesJsonPlugin } from './plugins/pagesJson'
import { uniPostVuePlugin } from './plugins/postVue'
import { uniRenderjsPlugin } from './plugins/renderjs'
import { uniResolveIdPlugin } from './plugins/resolveId'
import { uniSetupPlugin } from './plugins/setup'
import { uniSSRPlugin } from './plugins/ssr'
import type { VitePluginUniResolvedOptions } from '@dcloudio/uni-cli-shared'
import { uniMainJsCustomizePlugin } from './plugins/mainJsCustomize'
import { uniManifestJsonCustomizePlugin } from './plugins/manifestJsonCustomize'
import { uniPagesJsonCustomizePlugin } from './plugins/pagesJsonCustomize'



export default (options: VitePluginUniResolvedOptions)=> {
  const vitrualTsPlugins = options.h5?.split ? 
  [ 
    uniMainJsCustomizePlugin(options),
    uniManifestJsonCustomizePlugin(options),
    uniPagesJsonCustomizePlugin(options)
  ]:[
    uniMainJsPlugin(),
    uniManifestJsonPlugin(),
    uniPagesJsonPlugin()
  ]
  return [
  uniEasycomPlugin({ exclude: UNI_EASYCOM_EXCLUDE }),
  uniCssScopedPlugin({
    filter: (id) => isVueSfcFile(id) && !id.endsWith('App.vue'),
  }),
  uniResolveIdPlugin(),
  ...vitrualTsPlugins,
  uniInjectPlugin(),
  uniCssPlugin(),
  uniSSRPlugin(),
  uniSetupPlugin(),
  uniRenderjsPlugin(),
  uniH5Plugin(options),
  uniPostVuePlugin(),
]
}
