import {
  defineUniMainJsPlugin,
  isSsr,
  PAGES_JSON_JS,
  MANIFEST_JSON_JS
} from '@dcloudio/uni-cli-shared'
import { isSSR, isSsrManifest } from '../utils'
import type { VitePluginUniResolvedOptions } from '@dcloudio/uni-cli-shared'

function getGlobal(ssr?: boolean) {
  return ssr ? 'global' : 'window'
}


export function uniMainJsCustomizePlugin(uniOptions: VitePluginUniResolvedOptions ) {
  return defineUniMainJsPlugin((opts) => {
    let runSSR = false
    return {
      name: 'uni:h5-main-js',
      enforce: 'pre',
      configResolved(config) {
        runSSR =
          isSsr(config.command, config) || isSsrManifest(config.command, config)
      },
      transform(code, id, options) {
        if (opts.filter(id)) {
          const ssr = isSSR(options)
          const globalName = getGlobal(ssr)
          if(uniOptions.h5?.split === 'main'){
            
            return {
              code: `import './${MANIFEST_JSON_JS}';
  ${createSplitApp(code, globalName)}`,
              map: this.getCombinedSourcemap(),
            }

          }else if(uniOptions.h5?.split === 'page') {
            return {
              code: `import './${PAGES_JSON_JS}'`,
              map: this.getCombinedSourcemap(),
            }

          }
          if (!runSSR) {
            code = code.includes('createSSRApp')
              ? createApp(code, globalName)
              : createLegacyApp(code)
          } else {
            code = isSSR(options)
              ? createSSRServerApp(code)
              : createSSRClientApp(code)
          }
          code = `
          import './${PAGES_JSON_JS}'
          import './${MANIFEST_JSON_JS}';
          
          
          ${code};
          `
          return {
            code,
            map: this.getCombinedSourcemap(),
          }
        }
      },
    }
  })
}

function createSplitApp(code: string, globalName: string){
  return `import { plugin as __plugin } from '@dcloudio/uni-h5';${code.replace(
    'createSSRApp',
    'createVueApp as createSSRApp'
  )};const app = createApp().app;
  app.use(__plugin).mount("#app");

  `

}


function createApp(code: string, globalName: string) {
  return `import { plugin as __plugin } from '@dcloudio/uni-h5';${code.replace(
    'createSSRApp',
    'createVueApp as createSSRApp'
  )};const app = createApp().app; 
  app.use(__plugin).mount("#app");`
}

function createLegacyApp(code: string) {
  return `import { plugin as __plugin } from '@dcloudio/uni-h5';function createApp(rootComponent,rootProps){return createVueApp(rootComponent, rootProps).use(__plugin)};${code.replace(
    'createApp',
    'createVueApp'
  )}`
}

function createSSRClientApp(code: string) {
  return `import { plugin as __plugin } from '@dcloudio/uni-h5';import { UNI_SSR, UNI_SSR_STORE } from '@dcloudio/uni-shared';${code};const { app: __app, store: __store } = createApp();__app.use(__plugin);__store && window[UNI_SSR] && window[UNI_SSR][UNI_SSR_STORE] && __store.replaceState(window[UNI_SSR][UNI_SSR_STORE]);__app.router.isReady().then(() => __app.mount("#app"));`
}

function createSSRServerApp(code: string) {
  return code
}
