import type { PreRenderedChunk } from 'rollup'
import type { Plugin } from 'vite'
import path from 'path'
import colors from 'picocolors'
import {
  APP_SERVICE_FILENAME,
  commonjsProxyRE,
  createTransformTag,
  cssLangRE,
  dynamicImportPolyfill,
  generateCodeFrame,
  initPostcssPlugin,
  normalizePath,
  parseVueRequest,
  removeExt,
  resolveMainPathOnce,
} from '@dcloudio/uni-cli-shared'
import { parse } from '@dcloudio/uni-nvue-styler'
import { nvueOutDir } from '../../utils'
import { transformRenderWhole } from './transforms/transformRenderWhole'
import { transformAppendAsTree } from './transforms/transformAppendAsTree'
import { transformVideo } from './transforms/transformVideo'
import { transformText } from './transforms/transformText'
import { createConfigResolved } from '../../plugin/configResolved'
import { defaultNVueRpx2Unit } from '@dcloudio/uni-shared'
import { external, globals } from '../utils'
import { transformRootNode } from './transforms/transformRootNode'

const uTags = {
  text: 'u-text',
  image: 'u-image',
  input: 'u-input',
  textarea: 'u-textarea',
  video: 'u-video',
  'web-view': 'u-web-view',
  slider: 'u-slider',
}

export function initNVueNodeTransforms() {
  // 优先级必须确保 renderWhole > appendAsTree
  return [
    transformRootNode,
    createTransformTag(uTags),
    transformText,
    transformVideo,
    transformRenderWhole,
    transformAppendAsTree,
  ]
}

export function uniAppNVuePlugin({
  appService,
}: {
  appService: boolean
}): Plugin {
  const inputDir = process.env.UNI_INPUT_DIR
  const mainPath = resolveMainPathOnce(inputDir)
  return {
    name: 'uni:app-nvue',
    config() {
      return {
        css: {
          postcss: {
            plugins: initPostcssPlugin({
              uniApp: defaultNVueRpx2Unit,
              autoprefixer: false,
            }),
          },
        },
        build: {
          lib: {
            name: 'AppService',
            // 必须使用 lib 模式，否则会生成 preload 等代码
            fileName: appService ? 'app-service' : 'app',
            entry: mainPath,
            formats: [appService ? 'iife' : 'es'],
          },
          outDir: appService ? process.env.UNI_OUTPUT_DIR : nvueOutDir(),
          rollupOptions: {
            external: external(appService),
            output: {
              entryFileNames(chunk) {
                if (chunk.name === 'main' && chunk.isEntry) {
                  return appService ? APP_SERVICE_FILENAME : 'app.js'
                }
                return chunk.name + '.js'
              },
              assetFileNames: '[name][extname]',
              chunkFileNames: createChunkFileNames(inputDir),
              plugins: [dynamicImportPolyfill(true)],
              globals: globals(appService),
            },
          },
        },
      }
    },
    configResolved: createConfigResolved({
      createCssPostPlugin(config) {
        return {
          name: 'vite:css-post',
          buildStart() {
            // 用于覆盖原始插件方法
            // noop
          },
          async transform(source, filename) {
            if (!cssLangRE.test(filename) || commonjsProxyRE.test(filename)) {
              return
            }
            const { code, messages } = await parse(source, {
              filename,
              logLevel: 'WARNING',
            })
            messages.forEach((message) => {
              if (message.type === 'warning') {
                let msg = `[vite:css] ${message.text}`
                if (message.line && message.column) {
                  msg += `\n${generateCodeFrame(source, {
                    line: message.line,
                    column: message.column,
                  })}`
                }
                config.logger.warn(colors.yellow(msg))
              }
            })
            return { code: `export default ${code}`, map: { mappings: '' } }
          },
          generateBundle() {
            // 用于覆盖原始插件方法
            // noop
          },
        }
      },
    }),
  }
}

function createChunkFileNames(
  inputDir: string
): (chunkInfo: PreRenderedChunk) => string {
  return function chunkFileNames(chunk) {
    if (chunk.isDynamicEntry && chunk.facadeModuleId) {
      const { filename } = parseVueRequest(chunk.facadeModuleId)
      if (filename.endsWith('.nvue')) {
        return (
          removeExt(normalizePath(path.relative(inputDir, filename))) + '.js'
        )
      }
    }
    return '[name].js'
  }
}