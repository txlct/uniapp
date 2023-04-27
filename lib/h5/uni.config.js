const fs = require('fs')
const path = require('path')

function getTemplatePath (template) {
  if (template) {
    const userTemplate = path.resolve(process.env.UNI_INPUT_DIR, template)
    if (fs.existsSync(userTemplate)) { return userTemplate }
  }
  return path.resolve(process.env.UNI_CLI_CONTEXT, 'public/index.html')
}

function transform (content, platformOptions) {
  return content
}


function getIndexCssPath (assetsDir, template, hashKey) {
  const CopyWebpackPluginVersion = Number(require('copy-webpack-plugin/package.json').version.split('.')[0])
  const VUE_APP_INDEX_CSS_HASH = process.env[hashKey]
  if (VUE_APP_INDEX_CSS_HASH) {
    try {
      const templateContent = fs.readFileSync(getTemplatePath(template))
      if (new RegExp('\\b' + hashKey + '\\b').test(templateContent)) {
        return path.join(assetsDir, `[name].${VUE_APP_INDEX_CSS_HASH}${CopyWebpackPluginVersion > 5 ? '' : '.'}[ext]`)
      }
    } catch (e) { }
  }
  return assetsDir
}

module.exports = {
  options: {
    cssVars: {
      '--status-bar-height': '0px'
    },
    filterTag: 'wxs',
    vue: '@tencent/vue-cli-plugin-uni/packages/h5-vue'
  },
  copyWebpackOptions (platformOptions, vueOptions) {
    const copyOptions = [
      {
        from: require.resolve('@tencent/uni-h5/dist/index.css'),
        to: getIndexCssPath(vueOptions.assetsDir, platformOptions.template, 'VUE_APP_INDEX_CSS_HASH'),
        transform (content) {
          return transform(content, platformOptions)
        }
      },
      'hybrid/html'
    ]
    global.uniModules.forEach(module => {
      copyOptions.push('uni_modules/' + module + '/hybrid/html')
    })

    return copyOptions
  }
}
