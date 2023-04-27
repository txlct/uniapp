const path = require('path')
const BuiltinModule = require('module')

// Guard against poorly mocked module constructors
const Module = module.constructor.length > 1
  ? module.constructor
  : BuiltinModule

const oldResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parentModule, isMain, options) {
  if (request.indexOf('@tencent') === 0) {
    request = request.replace('@tencent', scopedPath)
  }
  return oldResolveFilename.call(this, request, parentModule, isMain, options)
}

const scopedPath = path.resolve(__dirname, '../../')

const compiler = require('../lib')
const res = compiler.compile(
  `
<custom data-a="1" :data-b="b"></custom>
`, {
    miniprogram: true,
    resourcePath: 'test.wxml',
    isReservedTag: function (tag) {
      return true
    },
    getTagNamespace () {
      return false
    },
    mp: {
      platform: 'mp-weixin'
    },
    filterModules: ['swipe'],
    service: true,
    view: true

  })
console.log(require('util').inspect(res, {
  colors: true,
  depth: null
}))
