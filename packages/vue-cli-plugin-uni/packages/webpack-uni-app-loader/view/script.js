const {
  jsPreprocessOptions
} = require('@tencent/uni-cli-shared')

const preprocessor = require('@tencent/vue-cli-plugin-uni/packages/webpack-preprocess-loader/preprocess')

const traverse = require('@tencent/webpack-uni-mp-loader/lib/babel/scoped-component-traverse')

const {
  parseComponents
} = require('./util')

function genComponentCode (components) {
  const importCode = []
  const componentsCode = []
  components.forEach(({
    name,
    value,
    source
  }) => {
    importCode.push(`import ${value} from '${source}'`)
    componentsCode.push(`'${name}': ${value}`)
  })
  return [importCode.join('\n'), componentsCode.join(',\n')]
}

function genCode ({
  components,
  options
}, css = []) {
  const optionsCode = []
  Object.keys(options).forEach(name => {
    options[name] !== null && optionsCode.push(`${name}:${options[name]}`)
  })
  const [importComponentCode, componentsCode] = genComponentCode(components)
  // TODO js 内引用 css
  return `
${importComponentCode}
export default {
  ${optionsCode.length ? (optionsCode.join(',') + ',') : ''}
  data(){
    return {
      wxsProps:{}
    }
  },
  components:{
    ${componentsCode}
  }
}
`
}

module.exports = function (content, map) {
  this.cacheable && this.cacheable()

  content = preprocessor.preprocess(content, jsPreprocessOptions.context, {
    type: jsPreprocessOptions.type
  })

  this.callback(null, genCode(parseComponents(content, traverse)), map)
}
