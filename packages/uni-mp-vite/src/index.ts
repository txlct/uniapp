import { extend } from '@vue/shared'
import type { SFCScriptCompileOptions } from '@vue/compiler-sfc'
import { uniViteInjectPlugin } from '@dcloudio/uni-cli-shared'
import { VitePluginUniOptions } from '@dcloudio/vite-plugin-uni'

import { uniMiniProgramPlugin, UniMiniProgramPluginOptions } from './plugin'
import { uniUsingComponentsPlugin } from './plugins/usingComponents'
import { uniMainJsPlugin } from './plugins/mainJs'
import { uniManifestJsonPlugin } from './plugins/manifestJson'
import { uniPagesJsonPlugin } from './plugins/pagesJson'
import { uniEntryPlugin } from './plugins/entry'

import { uniRenderjsPlugin } from './plugins/renderjs'
import { uniRuntimeHooksPlugin } from './plugins/runtimeHooks'
import { uniSubpackagePlugin } from './plugins/subpackage'
import { uniMiniProgramPluginPlugin } from './plugins/plugin'

export { UniMiniProgramPluginOptions } from './plugin'

export default (
  options: UniMiniProgramPluginOptions,
  opt: VitePluginUniOptions
) => {
  if (!options.app.subpackages) {
    delete process.env.UNI_SUBPACKAGE
  }
  if (!options.app.plugins) {
    delete process.env.UNI_MP_PLUGIN
  }
  const normalizeComponentName = options.template.component?.normalizeName
  return [
    (options: {
      vueOptions?: { script?: Partial<SFCScriptCompileOptions> }
    }) => {
      return uniMainJsPlugin({
        normalizeComponentName,
        babelParserPlugins: options.vueOptions?.script?.babelParserPlugins,
      })
    },
    uniManifestJsonPlugin(options),
    uniPagesJsonPlugin(options),
    uniEntryPlugin(options),
    uniViteInjectPlugin(
      'uni:mp-inject',
      extend({ exclude: [/uni.api.esm/, /uni.mp.esm/] }, options.vite.inject)
    ),
    uniRenderjsPlugin({ lang: options.template.filter?.lang }),
    uniRuntimeHooksPlugin(),
    uniMiniProgramPlugin(options, opt),
    (options: {
      vueOptions?: { script?: Partial<SFCScriptCompileOptions> }
    }) => {
      return uniUsingComponentsPlugin({
        normalizeComponentName,
        babelParserPlugins: options.vueOptions?.script?.babelParserPlugins,
      })
    },
    ...(process.env.UNI_SUBPACKAGE ? [uniSubpackagePlugin(options)] : []),
    ...(process.env.UNI_MP_PLUGIN ? [uniMiniProgramPluginPlugin(options)] : []),
  ]
}
