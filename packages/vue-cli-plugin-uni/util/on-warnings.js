const stringify = require('./stringify')
module.exports = function (errors) {
  const {
    runByHBuilderX
  } = require('@tencent/uni-cli-shared')
  if (runByHBuilderX) {
    console.log('WARNING: ' + stringify(errors))
  } else {
    console.warn(stringify(errors))
  }
}
