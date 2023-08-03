import type { Plugin, ResolvedConfig } from 'vite'
import {
  normalizeIdentifier,
  normalizePagesJson,
  defineUniPagesJsonPlugin,
  normalizePagesRoute,
  normalizePagePath,
  // MANIFEST_JSON_JS,
  // PAGES_JSON_JS
} from '@dcloudio/uni-cli-shared'
import type { VitePluginUniResolvedOptions } from '@dcloudio/uni-cli-shared'
import { isSSR } from '../utils'
// import fs from 'fs'
// import path from 'path'

export function uniPagesJsonPlugin(uniOptions: VitePluginUniResolvedOptions): Plugin {
  return defineUniPagesJsonPlugin((opts) => {
    return {
      name: 'uni:h5-pages-json',
      enforce: 'pre',
      transform(code, id, opt) {
        if (opts.filter(id)) {
          const { resolvedConfig } = opts
          const ssr = isSSR(opt)
          const reCode =  generatePagesJsonCode(ssr, code, resolvedConfig)
          return {
            code:reCode,
            map: { mappings: '' },
          }
        }
      },
      // writeBundle(options, bundle){
      //   if(!uniOptions.h5?.split){
      //     return
      //   }

      //   const pageJsonJs = Object.keys(bundle).find((key=>{
      //     return key.includes(PAGES_JSON_JS) && /\.js$/.test(key)
      //   }))
      //   if(!pageJsonJs){
      //     return
      //   }

      //   const outputPath = path.resolve(options.dir!, 'test.shtml');

      //   fs.writeFileSync(outputPath, `<script type="module" src="./${pageJsonJs}"></script>`)
      // }
    }
  })
}

function generatePagesJsonCode(
  ssr: boolean | undefined,
  jsonStr: string,
  config: ResolvedConfig
) {
  const globalName = getGlobal(ssr)
  const pagesJson = normalizePagesJson(jsonStr, process.env.UNI_PLATFORM)
  const { importLayoutComponentsCode, defineLayoutComponentsCode } =
    generateLayoutComponentsCode(globalName, pagesJson)
  const definePagesCode = generatePagesDefineCode(globalName, pagesJson, config)
  const uniRoutesCode = generateRoutes(globalName, pagesJson, config)
  const uniConfigCode = generateConfig(globalName, pagesJson)


  return `
import { defineAsyncComponent, resolveComponent, createVNode, withCtx, openBlock, createBlock } from 'vue'
const async = ${globalName}.__uniConfig && ${globalName}.__uniConfig.async || {}
const app =  ${globalName}.__app 

${importLayoutComponentsCode}
const extend = Object.assign
${uniConfigCode}
${defineLayoutComponentsCode}
${definePagesCode}
${uniRoutesCode}
${config.command === 'serve' ? hmrCode : ''}
export {}
`
}

const hmrCode = `if(import.meta.hot){
  import.meta.hot.on('invalidate', (data) => {
      import.meta.hot.invalidate()
  })
}`

function getGlobal(ssr?: boolean) {
  return ssr ? 'global' : 'window'
}



function generateLayoutComponentsCode(
  globalName: string,
  pagesJson: UniApp.PagesJson
) {
  const windowNames = {
    topWindow: -1,
    leftWindow: -2,
    rightWindow: -3,
  }
  let importLayoutComponentsCode = ''
  let defineLayoutComponentsCode = `${globalName}.__uniLayout = ${globalName}.__uniLayout || {}\n`
  Object.keys(windowNames).forEach((name) => {
    const windowConfig = pagesJson[name as keyof typeof windowNames]
    if (windowConfig && windowConfig.path) {
      importLayoutComponentsCode += `import ${name} from './${windowConfig.path}'\n`
      defineLayoutComponentsCode += `${globalName}.__uniConfig.${name}.component = ${globalName}.setupWindow(${name},${
        windowNames[name as keyof typeof windowNames]
      })\n`
    }
  })

  return {
    importLayoutComponentsCode,
    defineLayoutComponentsCode,
  }
}

function generatePageDefineCode(globalName: string, pageOptions: UniApp.PagesJsonPageOptions) {
  let pagePathWithExtname = normalizePagePath(pageOptions.path, 'h5')
  if (!pagePathWithExtname) {
    // 不存在时，仍引用，此时编译会报错文件不存在
    pagePathWithExtname = pageOptions.path + '.vue'
  }
  const pageIdent = normalizeIdentifier(pageOptions.path)
  return `const ${pageIdent}Loader = ()=>import('./${pagePathWithExtname}').then(com => ${globalName}.__setupPage(com.default || com))
const ${pageIdent} = defineAsyncComponent(extend({loader:${pageIdent}Loader},AsyncComponentOptions))`
}

function generatePagesDefineCode(
  globalName: string,
  pagesJson: UniApp.PagesJson,
  _config: ResolvedConfig
) {
  const { pages } = pagesJson
  return (
    `const AsyncComponentOptions = {
      delay: async.delay,
      timeout: async.timeout,
      suspensible: async.suspensible
    }
    if(async.loading){
      AsyncComponentOptions.loadingComponent = {
        name:'SystemAsyncLoading',
        render(){
          return createVNode(resolveComponent(async.loading))
        }
      }
    }
    if(async.error){
      AsyncComponentOptions.errorComponent = {
        name:'SystemAsyncError',
        render(){
          return createVNode(resolveComponent(async.error))
        }
      }
    }
  ` + pages.map((pageOptions) => generatePageDefineCode(globalName, pageOptions)).join('\n')
  )
}

function generatePageRoute(
  { path, meta }: UniApp.UniRoute,
  _config: ResolvedConfig,
  globalName: string
) {
  const { isEntry } = meta
  const alias = isEntry ? `\n  alias:'/${path}',` : ''
  // 目前单页面未处理 query=>props
  return `{
  path:'/${isEntry ? '' : path}',${alias}
  component:{setup(){ 
    const getApp = ${globalName}.getApp
    const app = getApp(); 
    const query = app && app.$route && app.$route.query || {}; 
  return ()=>renderPage(${normalizeIdentifier(
    path
  )},query)}},
  loader: ${normalizeIdentifier(path)}Loader,
  meta: ${JSON.stringify(meta)}
}`
}

function generatePagesRoute(
  pagesRouteOptions: UniApp.UniRoute[],
  config: ResolvedConfig,
  globalName: string
) {
  return pagesRouteOptions.map((pageOptions) =>
    generatePageRoute(pageOptions, config, globalName)
  )
}

function generateRoutes(
  globalName: string,
  pagesJson: UniApp.PagesJson,
  config: ResolvedConfig
) {
  return `
function renderPage(component,props){
  return (openBlock(), createBlock(${globalName}.PageComponent, null, {page: withCtx(() => [createVNode(component, extend({},props,{ref: "page"}), null, 512 /* NEED_PATCH */)]), _: 1 /* STABLE */}))
}
if(!${globalName}.__uniRoutes){
  ${globalName}.__uniRoutes = []
}
${globalName}.__uniRoutes=${globalName}.__uniRoutes.concat([
  ${[
    ...generatePagesRoute(normalizePagesRoute(pagesJson), config, globalName),
  ].join(
    ','
  )}].map(uniRoute=>(uniRoute.meta.route = (uniRoute.alias || uniRoute.path).slice(1),uniRoute)))`
}

function generateConfig(
  globalName: string,
  pagesJson: Record<string, any>,
) {
  delete pagesJson.pages
  delete pagesJson.subPackages
  delete pagesJson.subpackages
  pagesJson.compilerVersion = process.env.UNI_COMPILER_VERSION
  return `${globalName}.__uniConfig=extend(${JSON.stringify(pagesJson)},${globalName}.__uniConfig || {})
`
}
