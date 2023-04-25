const path = require('path')

const parser = require('@babel/parser')

const {
  removeExt,
  hyphenate,
  normalizePath,
  getComponentName,
  jsPreprocessOptions
} = require('@dcloudio/uni-cli-shared')

const {
  getBabelParserOptions
} = require('@dcloudio/uni-cli-shared/lib/platform')

const {
  isBuiltInComponentPath
} = require('@dcloudio/uni-cli-shared/lib/pages')

const {
  updateUsingComponents,
  updateComponentGenerics
} = require('@dcloudio/uni-cli-shared/lib/cache')

const preprocessor = require('@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/preprocess')

const traverse = require('./babel/scoped-component-traverse')

const {
  resolve,
  normalizeNodeModules,
  getIssuer
} = require('./shared')

const {
  findBabelLoader,
  addDynamicImport
} = require('./babel/util')

const isObject = val => Object.prototype.toString.call(val) === '[object Object]'
const uniI18n = require('@dcloudio/uni-cli-i18n')

module.exports = function (content, map) {
  this.cacheable && this.cacheable()

  content = preprocessor.preprocess(content, jsPreprocessOptions.context, {
    type: jsPreprocessOptions.type
  })

  let resourcePath = normalizeNodeModules(removeExt(normalizePath(path.relative(process.env.UNI_INPUT_DIR, this
    .resourcePath))))

  let type = ''
  if (resourcePath === 'App') {
    type = 'App'
  } else if (process.UNI_ENTRY[resourcePath]) {
    type = 'Page'
  }
  // <script src=""/>
  if (!type) {
    const moduleIssuer = getIssuer(this._compilation, this._module)
    if (moduleIssuer) {
      const moduleIssuerIssuer = getIssuer(this._compilation, moduleIssuer)
      if (moduleIssuerIssuer) {
        resourcePath = normalizeNodeModules(removeExt(normalizePath(path.relative(process.env.UNI_INPUT_DIR, moduleIssuerIssuer.resource))))
        if (resourcePath === 'App') {
          type = 'App'
        } else if (process.UNI_ENTRY[resourcePath]) {
          type = 'Page'
        }
      }
    }
  }

  if ( // windows 上 page-meta, navigation-bar 可能在不同盘上
    /^win/.test(process.platform) &&
    path.isAbsolute(resourcePath) &&
    isBuiltInComponentPath(resourcePath)
  ) {
    resourcePath = normalizePath(path.relative(process.env.UNI_CLI_CONTEXT, resourcePath))
  }

  if (!type) {
    type = 'Component'
  }

  const {
    state: {
      components,
      componentPlaceholder,
    }
  } = traverse(parser.parse(content, getBabelParserOptions()), {
    type,
    components: [],
    componentPlaceholder: [],
    filename: this.resourcePath
  })

  const callback = this.async()

  if (!components.length) {
    if (type === 'App') {
      callback(null, content, map)
      return
    }
    // 防止组件从有到无，App.vue 中不支持使用组件
    updateUsingComponents(resourcePath, Object.create(null), type)
    callback(null, content, map)
    return
  }

  const dynamicImports = Object.create(null)
  Promise.all(components.map(component => {
    if (component?.source?.startsWith('plugin://')) {
      return Promise.resolve(component)
    }

    return resolve.call(this, component.source).then(resolved => {
      component.name = getComponentName(hyphenate(component.name))
      const source = component.source
      component.source = normalizeNodeModules(removeExt(path.relative(process.env.UNI_INPUT_DIR,
        resolved)))
      // 非页面组件才需要 dynamic import
      if (!process.UNI_ENTRY[component.source]) {
        dynamicImports[source] = {
          identifier: component.value,
          chunkName: component.source,
          source: source
        }
      }
    })
  })).then(() => {
    const usingComponents = Object.create(null)

    components.forEach(({
      name,
      source
    }) => {
      const prefix = source.startsWith('plugin://') ? '' : '/'

      usingComponents[name] = `${prefix}${source}`
    })

    let babelLoader = findBabelLoader(this.loaders)
    if (!babelLoader) {
      callback(new Error(uniI18n.__('mpLoader.findFail', {
        0: 'babel-loader'
      })), content)
    } else {
      const webpack = require('webpack')
      if (webpack.version[0] > 4) {
        // clone babelLoader and options
        const index = this.loaders.indexOf(babelLoader)
        const newBabelLoader = Object.assign({}, babelLoader)
        Object.assign(newBabelLoader, { options: Object.assign({}, babelLoader.options) })
        this.loaders.splice(index, 1, newBabelLoader)
        babelLoader = newBabelLoader
      }
      addDynamicImport(babelLoader, resourcePath, dynamicImports)

      updateUsingComponents(resourcePath, usingComponents, type)

      isObject(componentPlaceholder) &&
        Object.keys(componentPlaceholder).length &&
        updateComponentGenerics(resourcePath, componentPlaceholder, 'componentPlaceholder')

      callback(null, content, map)
    }
  }, err => {
    callback(err, content, map)
  })
}
