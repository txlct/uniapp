module.exports = function (pagesJson, manifestJson, loader) {
  return require('@tencent/uni-quickapp-native/lib/manifest')(pagesJson, manifestJson, loader)
}
