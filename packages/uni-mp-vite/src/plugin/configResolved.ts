import debug from 'debug'
import type { Plugin, ResolvedConfig } from 'vite'
import type { EmittedAsset } from 'rollup'
import {
  injectAssetPlugin,
  injectCssPlugin,
  injectCssPostPlugin,
  normalizePath,
  resolveMainPathOnce,
  removeExt,
  transformScopedCss,
  normalizeMiniProgramFilename,
  relativeFile,
  cssPostPlugin,
} from '@dcloudio/uni-cli-shared'
import { UniMiniProgramPluginOptions } from '.'
import { getNVueCssPaths } from '../plugins/pagesJson'
import {
  isUniComponentUrl,
  isUniPageUrl,
  parseVirtualComponentPath,
  parseVirtualPagePath,
} from '../plugins/entry'

const debugNVueCss = debug('uni:nvue-css')
const cssVars = `page{--status-bar-height:25px;--top-window-height:0px;--window-top:0px;--window-bottom:0px;--window-left:0px;--window-right:0px;--window-magin:0px}`

const genComponentCustomHiddenCss = (name: string) =>
  `[${name.replace(':', '')}="true"]{display: none !important;}`

export function createConfigResolved({
  cdn,
  style: { extname },
  template: { component },
}: UniMiniProgramPluginOptions): Plugin['configResolved'] {
  function normalizeCssChunkFilename(id: string, extname: string) {
    return (
      removeExt(normalizeMiniProgramFilename(id, process.env.UNI_INPUT_DIR)) +
      extname
    )
  }
  return (config) => {
    const mainPath = resolveMainPathOnce(process.env.UNI_INPUT_DIR)
    fixUnocss(config)
    injectCssPlugin(config)

    let unocssGlobalBuildBundleIndex = config.plugins.findIndex(
      (p) => p.name === 'unocss:global:build:bundle'
    )

    if (unocssGlobalBuildBundleIndex === -1) {
      unocssGlobalBuildBundleIndex = config.plugins.findIndex(
        (p) => p.name === 'unocss:global:build:generate'
      )
    }

    const hasUnocssGlobalBuildBundle = unocssGlobalBuildBundleIndex > -1
    // unocss 是根据 .css 后缀来编译文件，需要先保持 css 文件后缀为 .css，等 unocss 处理完后，再重置回正确的文件后缀
    const cssExtname = hasUnocssGlobalBuildBundle ? '.css' : extname
    injectCssPostPlugin(
      config,
      cssPostPlugin(config, {
        platform: process.env.UNI_PLATFORM,
        chunkCssFilename(id: string) {
          if (id === mainPath) {
            return 'app' + cssExtname
          } else if (isUniPageUrl(id)) {
            return normalizeCssChunkFilename(
              parseVirtualPagePath(id),
              cssExtname
            )
          } else if (isUniComponentUrl(id)) {
            return normalizeCssChunkFilename(
              parseVirtualComponentPath(id),
              cssExtname
            )
          }
        },
        chunkCssCode(filename, cssCode) {
          cssCode = transformScopedCss(cssCode)
          if (filename === 'app' + cssExtname) {
            const componentCustomHiddenCss =
              (component &&
                component.vShow &&
                genComponentCustomHiddenCss(component.vShow)) ||
              ''
            if (config.isProduction) {
              return (
                cssCode +
                cssVars +
                componentCustomHiddenCss
              )
            } else {
              return cssCode + cssVars + componentCustomHiddenCss
            }
          }

          const nvueCssPaths = getNVueCssPaths(config)
          if (!nvueCssPaths || !nvueCssPaths.length) {
            return cssCode
          }
          const normalized = normalizePath(filename)
          if (nvueCssPaths.find((pageCssPath) => pageCssPath === normalized)) {
            debugNVueCss(normalized)
            return (
              `@import "${relativeFile(normalized, 'nvue' + extname)}";\n` +
              cssCode
            )
          }
          return cssCode
        },
      })
    )
    injectAssetPlugin(config)

    if (hasUnocssGlobalBuildBundle && extname !== '.css') {
      ;(config.plugins as Plugin[]).splice(
        unocssGlobalBuildBundleIndex + 1,
        0,
        adjustCssExtname(extname)
      )
    }
  }
}

function adjustCssExtname(extname: string): Plugin {
  return {
    name: 'uni:adjust-css-extname',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle)
      files.forEach((name) => {
        if (name.endsWith('.css')) {
          const asset = bundle[name] as EmittedAsset
          this.emitFile({
            fileName: name.replace('.css', extname),
            type: 'asset',
            source: asset.source,
          })
          delete bundle[name]
        }
      })
    },
  }
}
function fixUnocss(config: ResolvedConfig) {
  const unocssGlobalBuildScan = config.plugins.find(
    (p) => p.name === 'unocss:global:build:scan'
  )
  // TODO 原始的 scan 的 buildStart 会清空 vfsLayerMap，导致 watch 时，load 阶段 /__uno.css 获取不到
  // https://github.com/antfu/unocss/blob/main/packages/vite/src/modes/global/build.ts#L25
  if (unocssGlobalBuildScan) {
    // 隐患: task 未被清空
    unocssGlobalBuildScan.buildStart = () => {}
  }
}
