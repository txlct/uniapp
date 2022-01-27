const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const {
  getMainEntry,
  getH5Options,
  getSubPagesWithEntry
} = require('@dcloudio/uni-cli-shared')

const {
  getGlobalUsingComponentsCode
} = require('@dcloudio/uni-cli-shared/lib/pages')

const modifyVueLoader = require('../vue-loader')

const WebpackHtmlAppendPlugin = require('../../packages/webpack-html-append-plugin')

const WebpackUniAppPlugin = require('../../packages/webpack-uni-app-loader/plugin/index')

function resolve (dir) {
  return path.resolve(__dirname, '../../', dir)
}

const {
  title,
  publicPath,
  template,
  devServer
} = getH5Options()

const runtimePath = '@dcloudio/uni-mp-weixin/dist/mp.js'
const wxsPath = '@dcloudio/uni-mp-weixin/dist/wxs.js'
const uniCloudPath = path.resolve(__dirname, '../../packages/uni-cloud/dist/index.js')

function getProvides () {
  return {
    __f__: [path.resolve(__dirname, '../format-log.js'), 'log'],
    uniCloud: [uniCloudPath, 'default'],
    'wx.nextTick': [runtimePath, 'nextTick'],
    Page: [runtimePath, 'Page'],
    Component: [runtimePath, 'Component'],
    Behavior: [runtimePath, 'Behavior'],
    getDate: [wxsPath, 'getDate'],
    getRegExp: [wxsPath, 'getRegExp']
  }
}

const plugins = [
  new WebpackUniAppPlugin(),
  new webpack.ProvidePlugin(getProvides())
]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(new WebpackHtmlAppendPlugin(
    `
        <script>
        ${fs.readFileSync(path.resolve(__dirname, './auto-reload.js'), 'utf8')}
        </script>
        `
  ))
}

/**
 * @description 获取页面应用的pages 对象，支持MPA模式的pages对象组装；默认兜底获取单页面应用pages对象
 * 1. 使用 subPackages 里面提供的`root` 作为相关的pages key
 * 2. 若root 对应的pages下面存在main.ts/main.js 则使用作为入口文件，否则使用 src/main.ts or src/main.js
 *
 * @return {*}
 */
function getPagesConfig () {
  const pagesConfig = {}

  const basePagesConfigWithoutEntry = {
    // 模板来源
    template,
    // 在 dist/index.html 的输出
    filename: 'index.html',
    // 当使用 title 选项时，
    // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
    title,
    // 在这个页面中包含的块，默认情况下会包含
    // 提取出来的通用 chunk 和 vendor chunk。
    chunks: ['chunk-vendors', 'chunk-common', 'index'],
    baseUrl: publicPath
  }

  // 定义默认的单页面应用的pages配置
  pagesConfig.index = {
    // page 的入口
    entry: path.resolve(process.env.UNI_INPUT_DIR, getMainEntry()),
    ...basePagesConfigWithoutEntry
  }

  // 返回 subPackages 的页面config
  const subPagesEntryConfig = getSubPagesWithEntry()

  console.log('>> subPagesEntryConfig', subPagesEntryConfig)

  // 填充pages 的base config
  if (subPagesEntryConfig && Object.keys(subPagesEntryConfig).length) {
    Object.keys(subPagesEntryConfig).forEach(pageItem => {
      pageItem = {
        ...pageItem,
        ...basePagesConfigWithoutEntry
      }
    })
  }

  const extConfig = {
    ...pagesConfig,
    ...subPagesEntryConfig
  }

  console.log('>>> getPagesConfig extConfig', extConfig)

  return {
    ...pagesConfig,
    ...subPagesEntryConfig
  }
}

const pages = getPagesConfig()

console.log('>>> pages', pages)

const vueConfig = {
  parallel: false, // 因为传入了自定义 compiler，避免参数丢失，禁用parallel
  publicPath,
  // TODO: 修改并支持MPA 模式 by finleyliang
  pages: getPagesConfig()
}

if (devServer && Object.keys(devServer).length) {
  vueConfig.devServer = devServer
}

module.exports = {
  vueConfig,
  webpackConfig (webpackConfig) {
    let useBuiltIns = 'usage'

    const statCode = process.env.UNI_USING_STAT ? 'import \'@dcloudio/uni-stat\';' : ''

    try {
      const babelConfig = require(path.resolve(process.env.UNI_CLI_CONTEXT, 'babel.config.js'))
      useBuiltIns = babelConfig.presets[0][1].useBuiltIns
    } catch (e) {}

    const beforeCode = (useBuiltIns === 'entry' ? 'import \'@babel/polyfill\';' : '') +
      `import 'uni-pages';import 'uni-${process.env.UNI_PLATFORM}';`

    return {
      resolve: {
        extensions: ['.nvue'],
        alias: {
          'vue-router': resolve('packages/h5-vue-router'),
          'uni-h5': require.resolve('@dcloudio/uni-h5')
        }
      },
      module: {
        rules: [{
          test: path.resolve(process.env.UNI_INPUT_DIR, getMainEntry()),
          use: [{
            loader: path.resolve(__dirname, '../../packages/wrap-loader'),
            options: {
              before: [
                beforeCode + require('../util').getAutomatorCode() + statCode +
                getGlobalUsingComponentsCode()
              ]
            }
          }]
        }, {
          test: /App\.vue$/,
          use: {
            loader: path.resolve(__dirname, '../../packages/wrap-loader'),
            options: {
              before: ['<template><App :keepAliveInclude="keepAliveInclude"/></template>']
            }
          }
        }, { // 解析组件，css 等
          resourceQuery: /vue&type=script/,
          use: [{
            loader: path.resolve(__dirname,
              '../../packages/webpack-uni-app-loader/using-components')
          }]
        }, {
          resourceQuery: /vue&type=template/,
          use: [{
            loader: resolve('packages/webpack-uni-app-loader/filter-modules-template.js')
          }, {
            loader: '@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta'
          }]
        }, {
          resourceQuery: [/lang=wxs/, /blockType=wxs/],
          use: [{
            loader: resolve('packages/webpack-uni-filter-loader')
          }]
        }]
      },
      resolveLoader: {
        alias: {
          'vue-style-loader': resolve('packages/h5-vue-style-loader')
        }
      },
      plugins,
      devServer: {
        watchOptions: require('../util').getWatchOptions()
      }
    }
  },
  chainWebpack (webpackConfig, vueOptions, api) {
    webpackConfig.plugins.delete('copy')

    if (!process.env.UNI_OPT_PREFETCH) {
      webpackConfig.plugins.delete('prefetch-index')
    }
    if (!process.env.UNI_OPT_PRELOAD) {
      webpackConfig.plugins.delete('preload-index')
    }

    const compilerOptions = require('./compiler-options')
    if (publicPath === './') {
      compilerOptions.publicPath = publicPath
    }
    modifyVueLoader(webpackConfig, {
      isH5: true,
      hotReload: true
    }, compilerOptions, api)

    if (process.env.NODE_ENV === 'production') {
      require('./cssnano-options')(webpackConfig)
    }
  }
}
