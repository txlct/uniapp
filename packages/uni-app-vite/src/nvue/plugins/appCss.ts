import type { Plugin } from 'vite'
import type { PluginContext, RollupError } from 'rollup'
import path from 'path'
import fs from 'fs-extra'
import qs from 'querystring'
import {
  CompilerError,
  parse,
  SFCBlock,
  SFCDescriptor,
} from '@vue/compiler-sfc'
import { hash, preNVueHtml, preNVueJs } from '@dcloudio/uni-cli-shared'

declare module '@vue/compiler-sfc' {
  interface SFCDescriptor {
    id: string
  }
}

export const APP_CSS_JS = './app.css.js'
export function uniAppCssPlugin(): Plugin {
  const inputDir = process.env.UNI_INPUT_DIR
  return {
    name: 'uni:app-nvue-app-style',
    resolveId(id) {
      if (id === APP_CSS_JS) {
        return APP_CSS_JS
      }
    },
    load(id) {
      if (id === APP_CSS_JS) {
        return genAppStylesCode(inputDir, this)
      }
    },
  }
}

const defaultAppStylesCode = `export const AppStyles = []`

async function genAppStylesCode(
  inputDir: string,
  pluginContext: PluginContext
) {
  const filename = path.resolve(inputDir, 'App.vue')
  const descriptor = createAppDescriptor(filename, pluginContext)
  if (!descriptor.styles.length) {
    return defaultAppStylesCode
  }
  let stylesCode = ``
  const styleVars: string[] = []
  for (let i = 0; i < descriptor.styles.length; i++) {
    const style = descriptor.styles[i]
    const src = style.src || descriptor.filename
    const attrsQuery = attrsToQuery(style.attrs, 'css')
    const srcQuery = style.src ? `&src=${descriptor.id}` : ``
    const query = `?vue&type=style&index=${i}${srcQuery}&inline`
    const styleRequest = src + query + attrsQuery
    stylesCode += `\nimport _style_${i} from ${JSON.stringify(styleRequest)}`
    styleVars.push(`_style_${i}`)
  }
  return `${stylesCode}
export const AppStyles = [${styleVars.join(',')}]
`
}

function readAppCode(filename: string) {
  if (!fs.existsSync(filename)) {
    return ``
  }
  const source = fs.readFileSync(filename, 'utf8')
  if (source.includes('#endif')) {
    return preNVueJs(preNVueHtml(source))
  }
  return source
}

let appDescriptor: SFCDescriptor
function createAppDescriptor(
  filename: string,
  pluginContext: PluginContext
): SFCDescriptor {
  const source = readAppCode(filename)
  const id = hash(source)
  if (!appDescriptor || appDescriptor.id !== id) {
    const { descriptor, errors } = parse(source, {
      filename,
    })
    descriptor.id = id
    if (errors.length) {
      errors.forEach((error) =>
        pluginContext.error(createRollupError(filename, error))
      )
    }
    appDescriptor = descriptor
  }
  return appDescriptor
}

export function createRollupError(
  id: string,
  error: CompilerError | SyntaxError
): RollupError {
  const { message, name, stack } = error
  const rollupError: RollupError = {
    id,
    plugin: 'vue',
    message,
    name,
    stack,
  }

  if ('code' in error && error.loc) {
    rollupError.loc = {
      file: id,
      line: error.loc.start.line,
      column: error.loc.start.column,
    }
  }

  return rollupError
}

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = ['id', 'index', 'src', 'type', 'lang', 'module']

function attrsToQuery(
  attrs: SFCBlock['attrs'],
  langFallback?: string,
  forceLangFallback = false
): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}${
        value ? `=${qs.escape(String(value))}` : ``
      }`
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs
        ? forceLangFallback
          ? `&lang.${langFallback}`
          : `&lang.${attrs.lang}`
        : `&lang.${langFallback}`
  }
  return query
}