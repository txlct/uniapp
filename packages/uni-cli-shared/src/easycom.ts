import fs from 'fs'
import path from 'path'
import debug from 'debug'

import { extend } from '@vue/shared'
import { createFilter } from '@rollup/pluginutils'

import { once } from '@dcloudio/uni-shared'
import { normalizePath } from './utils'
import { parsePagesJson, parsePagesJsonOnce } from './json/pages'
import { M } from './messages'
import { initUTSComponents } from './uts'

interface EasycomOption {
  dirs?: string[]
  rootDir: string
  extensions?: string[]
  autoscan?: boolean
  custom?: EasycomCustom
}
export interface EasycomMatcher {
  pattern: RegExp
  replacement: string
}
interface EasycomCustom {
  [key: string]: string
}

const debugEasycom = debug('uni:easycom')

type IGlobal = typeof globalThis & {
  easycoms : EasycomMatcher[],
  easycomsCache :  Map<string, string>,
  easycomsInvalidCache :  Set<string>,
  hasEasycom : boolean,
}

function clearEasycom() {
  (global as IGlobal).easycoms.length = 0;

  (global as IGlobal).easycomsCache.clear();
  (global as IGlobal).easycomsInvalidCache.clear();
}

export function initEasycoms(
  inputDir: string,
  { dirs, platform }: { dirs: string[]; platform: UniApp.PLATFORM }
) {

  global = {
    ...global,
    easycoms : [] as EasycomMatcher[],
    easycomsCache :  new Map<string, string>(),
    easycomsInvalidCache : new Set<string>(),
    hasEasycom : false,
  } as IGlobal

  const componentsDir = path.resolve(inputDir, 'components')
  const uniModulesDir = path.resolve(inputDir, 'uni_modules')
  const initEasycomOptions = (pagesJson?: UniApp.PagesJson) => {
    // 初始化时，从once中读取缓存，refresh时，实时读取
    const { easycom } = pagesJson || parsePagesJson(inputDir, platform, false)
    const easycomOptions: EasycomOption = {
      dirs:
        easycom && easycom.autoscan === false
          ? [...dirs] // 禁止自动扫描
          : [
              ...dirs,
              componentsDir,
              ...initUniModulesEasycomDirs(uniModulesDir),
            ],
      rootDir: inputDir,
      autoscan: !!(easycom && easycom.autoscan),
      custom: (easycom && easycom.custom) || {},
    }
    debugEasycom(easycomOptions)
    return easycomOptions
  }
  const options = initEasycomOptions(parsePagesJsonOnce(inputDir, platform))
  const initUTSEasycom = () => {
    initUTSComponents(inputDir, platform).forEach((item) => {
      const index = (global as IGlobal).easycoms.findIndex(
        (easycom) => item.pattern.toString() === easycom.pattern.toString()
      )
      if (index > -1) {
        (global as IGlobal).easycoms.splice(index, 1, item)
      } else {
        (global as IGlobal).easycoms.push(item)
      }
    })
  }
  initEasycom(options)
  initUTSEasycom()
  const res = {
    options,
    filter: createFilter(
      [
        'components/*/*.(vue|jsx|tsx)',
        'uni_modules/*/components/*/*.(vue|jsx|tsx)',
        'utssdk/*/**/*.vue',
        'uni_modules/*/utssdk/*/*.vue',
      ],
      [],
      {
        resolve: inputDir,
      }
    ),
    refresh() {
      res.options = initEasycomOptions()
      initEasycom(res.options)
      initUTSEasycom()
    },
    easycoms: (global as IGlobal).easycoms,
  }
  return res
}

export const initEasycomsOnce = once(initEasycoms)

function initUniModulesEasycomDirs(uniModulesDir: string) {
  if (!fs.existsSync(uniModulesDir)) {
    return []
  }
  return fs
    .readdirSync(uniModulesDir)
    .map((uniModuleDir) => {
      const uniModuleComponentsDir = path.resolve(
        uniModulesDir,
        uniModuleDir,
        'components'
      )
      if (fs.existsSync(uniModuleComponentsDir)) {
        return uniModuleComponentsDir
      }
    })
    .filter<string>(Boolean as any)
}

function initEasycom({
  dirs,
  rootDir,
  custom,
  extensions = ['.vue', '.jsx', '.tsx'],
}: EasycomOption) {
  clearEasycom()
  const easycomsObj = Object.create(null)
  if (dirs && dirs.length && rootDir) {
    extend(easycomsObj, initAutoScanEasycoms(dirs, rootDir, extensions))
  }
  if (custom) {
    Object.keys(custom).forEach((name) => {
      const componentPath = custom[name]
      easycomsObj[name] = componentPath.startsWith('@/')
        ? normalizePath(path.join(rootDir!, componentPath.slice(2)))
        : componentPath
    })
  }
  Object.keys(easycomsObj).forEach((name) => {
    (global as IGlobal).easycoms.push({
      pattern: new RegExp(name),
      replacement: easycomsObj[name],
    })
  })
  debugEasycom((global as IGlobal).easycoms);
  (global as IGlobal).hasEasycom = !!(global as IGlobal).easycoms.length
  return (global as IGlobal).easycoms
}

export function matchEasycom(tag: string) {
  if (!(global as IGlobal).hasEasycom) {
    return
  }
  let source = (global as IGlobal).easycomsCache.get(tag)
  if (source) {
    return source
  }
  if ((global as IGlobal).easycomsInvalidCache.has(tag)) {
    return false
  }
  const matcher = (global as IGlobal).easycoms.find((matcher) => matcher.pattern.test(tag))
  if (!matcher) {
    (global as IGlobal).easycomsInvalidCache.add(tag)
    return false
  }
  source = tag.replace(matcher.pattern, matcher.replacement);
  (global as IGlobal).easycomsCache.set(tag, source)
  debugEasycom('matchEasycom', tag, source)
  return source
}

const isDir = (path: string) => fs.lstatSync(path).isDirectory()

function initAutoScanEasycom(
  dir: string,
  rootDir: string,
  extensions: string[]
): Record<string, string> {
  if (!path.isAbsolute(dir)) {
    dir = path.resolve(rootDir, dir)
  }
  const easycoms = Object.create(null)
  if (!fs.existsSync(dir)) {
    return easycoms
  }
  fs.readdirSync(dir).forEach((name) => {
    const folder = path.resolve(dir, name)
    if (!isDir(folder)) {
      return
    }
    const importDir = normalizePath(folder)
    const files = fs.readdirSync(folder)
    // 读取文件夹文件列表，比对文件名（fs.existsSync在大小写不敏感的系统会匹配不准确）
    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i]
      if (files.includes(name + ext)) {
        easycoms[`^${name}$`] = `${importDir}/${name}${ext}`
        break
      }
    }
  })
  return easycoms
}

function initAutoScanEasycoms(
  dirs: string[],
  rootDir: string,
  extensions: string[]
) {
  const conflict: Record<string, string[]> = {}
  const res = dirs.reduce<Record<string, string>>(
    (easycoms: Record<string, string>, dir: string) => {
      const curEasycoms = initAutoScanEasycom(dir, rootDir, extensions)
      Object.keys(curEasycoms).forEach((name) => {
        // Use the first component when name conflict
        const componentPath = easycoms[name]
        if (!componentPath) {
          easycoms[name] = curEasycoms[name]
        } else {
          ;(conflict[componentPath] || (conflict[componentPath] = [])).push(
            normalizeComponentPath(curEasycoms[name], rootDir)
          )
        }
      })
      return easycoms
    },
    Object.create(null)
  )
  const conflictComponents = Object.keys(conflict)
  if (conflictComponents.length) {
    console.warn(M['easycom.conflict'])
    conflictComponents.forEach((com) => {
      console.warn(
        [normalizeComponentPath(com, rootDir), conflict[com]].join(',')
      )
    })
  }
  return res
}

function normalizeComponentPath(componentPath: string, rootDir: string) {
  return normalizePath(path.relative(rootDir, componentPath))
}

export function addImportDeclaration(
  importDeclarations: string[],
  local: string,
  source: string,
  imported?: string
) {
  importDeclarations.push(createImportDeclaration(local, source, imported))
  return local
}

function createImportDeclaration(
  local: string,
  source: string,
  imported?: string
) {
  if (imported) {
    return `import { ${imported} as ${local} } from '${source}';`
  }
  return `import ${local} from '${source}';`
}

const RESOLVE_EASYCOM_IMPORT_CODE = `import { resolveDynamicComponent as __resolveDynamicComponent } from 'vue';import { resolveEasycom } from '@dcloudio/uni-app';`

export function genResolveEasycomCode(
  importDeclarations: string[],
  code: string,
  name: string
) {
  if (!importDeclarations.includes(RESOLVE_EASYCOM_IMPORT_CODE)) {
    importDeclarations.push(RESOLVE_EASYCOM_IMPORT_CODE)
  }
  return `resolveEasycom(${code.replace(
    '_resolveComponent',
    '__resolveDynamicComponent'
  )}, ${name})`
}

export const UNI_EASYCOM_EXCLUDE = [/App.vue$/, /@dcloudio\/uni-h5/]
