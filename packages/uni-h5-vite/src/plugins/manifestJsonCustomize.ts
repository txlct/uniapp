import type { Plugin, ResolvedConfig } from 'vite'

import {
  defineUniManifestJsonPlugin,
  normalizeNetworkTimeout,
  parseJson,
  initI18nOptions,
  normalizeThemeConfigOnce,
  API_DEPS_CSS,
  FEATURE_DEFINES,
  H5_FRAMEWORK_STYLE_PATH,
  BASE_COMPONENTS_STYLE_PATH,
  isEnableTreeShaking,
  parseManifestJsonOnce
} from '@dcloudio/uni-cli-shared'
import type { VitePluginUniResolvedOptions } from '@dcloudio/uni-cli-shared'
import { isSSR } from '../utils'

const defaultRouter = {
  mode: 'hash',
  base: '/',
  assets: 'assets',
  routerBase: '/',
}

const defaultAsync = {
  loading: 'AsyncLoading',
  error: 'AsyncError',
  delay: 200,
  timeout: 60000,
  suspensible: true,
}


function getGlobal(ssr?: boolean) {
  return ssr ? 'global' : 'window'
}



function generateConfig(
  globalName: string,
) {

  return `${globalName}.__uniConfig=extend(${globalName}.__uniConfig || {},
  
  {
  appId,
  appName,
  appVersion,
  appVersionCode,
  async,
  debug,
  networkTimeout,
  sdkConfigs,
  qqMapKey,
  googleMapKey,
  aMapKey,
  aMapSecurityJsCode,
  aMapServiceHost,
  nvue,
  locale,
  fallbackLocale,
  locales:Object.keys(locales).reduce((res,name)=>{const locale=name.replace(/\\.\\/locale\\/(uni-app.)?(.*).json/,'$2');extend(res[locale]||(res[locale]={}),locales[name].default);return res},{}),
  router,
  darkmode,
  themeConfig,
})
`
}



function generateCssCode(config: ResolvedConfig) {
  const define = config.define! as FEATURE_DEFINES
  const cssFiles = [H5_FRAMEWORK_STYLE_PATH + 'base.css']

  // if (define.__UNI_FEATURE_PAGES__) {
  cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'async.css')
  // }
  if (define.__UNI_FEATURE_RESPONSIVE__) {
    cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'layout.css')
  }
  if (define.__UNI_FEATURE_NAVIGATIONBAR__) {
    cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'pageHead.css')
  }
  if (define.__UNI_FEATURE_TABBAR__) {
    cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'tabBar.css')
  }
  if (define.__UNI_FEATURE_NVUE__) {
    cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'nvue.css')
  }
  if (define.__UNI_FEATURE_PULL_DOWN_REFRESH__) {
    cssFiles.push(H5_FRAMEWORK_STYLE_PATH + 'pageRefresh.css')
  }
  if (define.__UNI_FEATURE_NAVIGATIONBAR_SEARCHINPUT__) {
    cssFiles.push(BASE_COMPONENTS_STYLE_PATH + 'input.css')
  }
  const enableTreeShaking = isEnableTreeShaking(
    parseManifestJsonOnce(process.env.UNI_INPUT_DIR)
  )
  if (config.command === 'serve' || !enableTreeShaking) {
    // 开发模式或禁用摇树优化，自动添加所有API相关css
    Object.keys(API_DEPS_CSS).forEach((name) => {
      const styles = API_DEPS_CSS[name as keyof typeof API_DEPS_CSS]
      styles.forEach((style) => {
        if (!cssFiles.includes(style)) {
          cssFiles.push(style)
        }
      })
    })
  }
  return cssFiles.map((file) => `import '${file}'`).join('\n')
}


// 兼容 wx 对象
function registerGlobalCode(config: ResolvedConfig, uniOptions:VitePluginUniResolvedOptions, ssr?: boolean, ) {
  const name = getGlobal(ssr)
  const enableTreeShaking = isEnableTreeShaking(
    parseManifestJsonOnce(process.env.UNI_INPUT_DIR)
  )

  if (enableTreeShaking && config.command === 'build' && !ssr && !uniOptions.h5?.split) {
    // 非 SSR 的发行模式，补充全局 uni 对象
    return `import { upx2px, getApp } from '@dcloudio/uni-h5';${name}.uni = {};${name}.wx = {};${name}.rpx2px = upx2px;${name}.getApp = getApp`
  }

  return `
import { uni,upx2px,getCurrentPages,getApp,UniServiceJSBridge,UniViewJSBridge, setupPage, PageComponent, setupWindow} from '@dcloudio/uni-h5'
${name}.getApp = getApp
${name}.getCurrentPages = getCurrentPages
${name}.wx = uni
${name}.uni = uni
${name}.UniViewJSBridge = UniViewJSBridge
${name}.UniServiceJSBridge = UniServiceJSBridge
${name}.rpx2px = upx2px
${name}.PageComponent = PageComponent
${name}.setupWindow = setupWindow
${name}.__setupPage = (com)=>setupPage(com)
`
}

export function uniManifestJsonCustomizePlugin(uniOptions: VitePluginUniResolvedOptions): Plugin {
  return defineUniManifestJsonPlugin((opts) => {
    let resolvedConfig: ResolvedConfig
    return {
      name: 'uni:h5-manifest-json',
      enforce: 'pre',
      configResolved(config) {
        defaultRouter.assets = config.build.assetsDir
        resolvedConfig = config
      },
      transform(code, id, opt) {
        if (!opts.filter(id)) {
          return
        }
        const manifest = parseJson(code)
        const { debug, h5 } = manifest
        const router = {
          ...defaultRouter,
          ...{ base: resolvedConfig.base },
          ...((h5 && h5.router) || {}),
        }
        if (!router.base) {
          router.base = '/'
        }

        /**
         * ssr时base和访问域名不一致导致跳到错误链接，其实应该区分server和client的部署路径，后续有需求可以加上
         */
        router.routerBase = new URL(router.base, 'http://localhost').pathname

        const async = { ...defaultAsync, ...((h5 && h5.async) || {}) }

        const networkTimeout = normalizeNetworkTimeout(manifest.networkTimeout)

        const sdkConfigs = (h5 && h5.sdkConfigs) || {}

        const qqMapKey =
          sdkConfigs.maps && sdkConfigs.maps.qqmap && sdkConfigs.maps.qqmap.key

        const googleMapKey =
          sdkConfigs.maps &&
          sdkConfigs.maps.google &&
          sdkConfigs.maps.google.key

        const aMapKey =
          sdkConfigs.maps && sdkConfigs.maps.amap && sdkConfigs.maps.amap.key

        const aMapSecurityJsCode =
          sdkConfigs.maps &&
          sdkConfigs.maps.amap &&
          sdkConfigs.maps.amap.securityJsCode

        const aMapServiceHost =
          sdkConfigs.maps &&
          sdkConfigs.maps.amap &&
          sdkConfigs.maps.amap.serviceHost

        let locale: string | null | undefined = manifest.locale
        locale = locale && locale.toUpperCase() !== 'AUTO' ? locale : ''

        const i18nOptions = initI18nOptions(
          process.env.UNI_PLATFORM,
          process.env.UNI_INPUT_DIR,
          false,
          false
        )
        const fallbackLocale = (i18nOptions && i18nOptions.locale) || ''

        const flexDirection =
          (manifest['app'] &&
            manifest['app'].nvue &&
            manifest['app'].nvue['flex-direction']) ||
          'column'

        const platformConfig =
          manifest[
            process.env.UNI_PLATFORM === 'app'
              ? 'app-plus'
              : process.env.UNI_PLATFORM
          ] || {}


          const ssr = isSSR(opt)
          const globalName = getGlobal(ssr)

          const uniConfigCode = generateConfig(globalName)
          const cssCode = generateCssCode(resolvedConfig)

        return {
          code: `
          ${registerGlobalCode(resolvedConfig, uniOptions, ssr)}
  const extend = Object.assign
  const locales = import.meta.globEager('./locale/*.json')

  export const appId = ${JSON.stringify(manifest.appid || '')}
  export const appName = ${JSON.stringify(manifest.name || '')}
  export const appVersion = ${JSON.stringify(manifest.versionName || '')}
  export const appVersionCode = ${JSON.stringify(manifest.versionCode || '')}

  export const debug = ${!!debug}
  export const nvue = ${JSON.stringify({
    'flex-direction': flexDirection,
  })}
  export const networkTimeout = ${JSON.stringify(networkTimeout)}
  // h5
  export const router = ${JSON.stringify(router)}
  export const async = ${JSON.stringify(async)}
  export const qqMapKey = ${JSON.stringify(qqMapKey)}
  export const googleMapKey = ${JSON.stringify(googleMapKey)}
  export const aMapKey = ${JSON.stringify(aMapKey)}
  export const aMapSecurityJsCode = ${JSON.stringify(aMapSecurityJsCode)}
  export const aMapServiceHost = ${JSON.stringify(aMapServiceHost)}
  export const sdkConfigs = ${JSON.stringify(sdkConfigs)}
  export const locale = '${locale}'
  export const fallbackLocale = '${fallbackLocale}'
  export const darkmode = ${platformConfig.darkmode || 'false'}
  export const themeConfig = ${JSON.stringify(
    normalizeThemeConfigOnce(platformConfig)
  )}


  ${cssCode}
${uniConfigCode}



  `,
          map: { mappings: '' },
        }
      },
    }
  })
}
