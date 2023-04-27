module.exports = (api, options, rootOptions) => {
  const mainVersion = require('./package.json').version
  const version = '^' + mainVersion
  api.extendPackage(pkg => {
    delete pkg.postcss
    delete pkg.browserslist
    return {
      scripts: {
        info: 'node node_modules/@tencent/vue-cli-plugin-uni/commands/info.js',
        serve: 'npm run dev:h5',
        build: 'npm run build:h5',
        'serve:quickapp-native': 'node node_modules/@tencent/uni-quickapp-native/bin/serve.js',
        'dev:h5': 'cross-env NODE_ENV=development UNI_PLATFORM=h5 vue-cli-service uni-serve',
        'dev:mp-qq': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-qq vue-cli-service uni-build --watch',
        'dev:mp-weixin': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin vue-cli-service uni-build --watch',
        'dev:mp-baidu': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-baidu vue-cli-service uni-build --watch',
        'dev:mp-alipay': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-alipay vue-cli-service uni-build --watch',
        'dev:mp-toutiao': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-toutiao vue-cli-service uni-build --watch',
        'dev:mp-kuaishou': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-kuaishou vue-cli-service uni-build --watch',
        'dev:mp-lark': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-lark vue-cli-service uni-build --watch',
        'dev:mp-jd': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-jd vue-cli-service uni-build --watch',
        'dev:mp-xhs': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-xhs vue-cli-service uni-build --watch',
        'dev:quickapp-native': 'cross-env NODE_ENV=development UNI_PLATFORM=quickapp-native vue-cli-service uni-build --watch',
        'dev:quickapp-webview': 'cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview vue-cli-service uni-build --watch',
        'dev:quickapp-webview-huawei': 'cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview-huawei vue-cli-service uni-build --watch',
        'dev:quickapp-webview-union': 'cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview-union vue-cli-service uni-build --watch',
        'build:h5': 'cross-env NODE_ENV=production UNI_PLATFORM=h5 vue-cli-service uni-build',
        'build:mp-qq': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-qq vue-cli-service uni-build',
        'build:mp-weixin': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-weixin vue-cli-service uni-build',
        'build:mp-baidu': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-baidu vue-cli-service uni-build',
        'build:mp-alipay': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-alipay vue-cli-service uni-build',
        'build:mp-toutiao': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-toutiao vue-cli-service uni-build',
        'build:mp-kuaishou': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-kuaishou vue-cli-service uni-build',
        'build:mp-lark': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-lark vue-cli-service uni-build',
        'build:mp-jd': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-jd vue-cli-service uni-build',
        'build:mp-xhs': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-xhs vue-cli-service uni-build',
        'build:quickapp-native': 'cross-env NODE_ENV=production UNI_PLATFORM=quickapp-native vue-cli-service uni-build',
        'build:quickapp-webview': 'cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview vue-cli-service uni-build',
        'build:quickapp-webview-huawei': 'cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview-huawei vue-cli-service uni-build',
        'build:quickapp-webview-union': 'cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview-union vue-cli-service uni-build',
        'dev:mp-360': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-360 vue-cli-service uni-build --watch',
        'build:mp-360': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-360 vue-cli-service uni-build',
        'dev:custom': 'cross-env NODE_ENV=development uniapp-cli custom',
        'build:custom': 'cross-env NODE_ENV=production uniapp-cli custom',
        'test:h5': 'cross-env UNI_PLATFORM=h5 jest -i',
        'test:ios': 'cross-env UNI_PLATFORM=app-plus UNI_OS_NAME=ios jest -i',
        'test:android': 'cross-env UNI_PLATFORM=app-plus UNI_OS_NAME=android jest -i',
        'test:mp-weixin': 'cross-env UNI_PLATFORM=mp-weixin jest -i',
        'test:mp-baidu': 'cross-env UNI_PLATFORM=mp-baidu jest -i'
      },
      'uni-app': {
        scripts: {}
      },
      dependencies: {
        '@tencent/uni-app': version,
        '@tencent/uni-app-plus': version,
        '@tencent/uni-h5': version,
        '@tencent/uni-mp-vue': version,
        '@tencent/uni-mp-qq': version,
        '@tencent/uni-mp-weixin': version,
        '@tencent/uni-mp-baidu': version,
        '@tencent/uni-mp-alipay': version,
        '@tencent/uni-mp-toutiao': version,
        '@tencent/uni-mp-lark': version,
        '@tencent/uni-mp-jd': version,
        '@tencent/uni-mp-xhs': version,
        '@tencent/uni-mp-360': version,
        '@tencent/uni-mp-kuaishou': version,
        '@tencent/uni-quickapp-native': version,
        '@tencent/uni-quickapp-webview': version,
        '@tencent/uni-stat': version,
        '@tencent/uni-i18n': version,
        '@tencent/uni-stacktracey': version,
        '@vue/shared': '^3.0.0',
        flyio: '^0.6.2',
        vuex: '^3.2.0'
      },
      devDependencies: {
        '@tencent/uni-automator': version,
        '@tencent/uni-cli-i18n': version,
        '@tencent/uni-cli-shared': version,
        '@tencent/uni-migration': version,
        '@tencent/uni-template-compiler': version,
        '@tencent/vue-cli-plugin-hbuilderx': version,
        '@tencent/vue-cli-plugin-uni': version,
        '@tencent/vue-cli-plugin-uni-optimize': version,
        '@tencent/webpack-uni-mp-loader': version,
        '@tencent/webpack-uni-pages-loader': version,
        'babel-plugin-import': '^1.11.0',
        'cross-env': '^7.0.2',
        jest: '^25.4.0'
      },
      browserslist: [
        'Android >= 4.4',
        'ios >= 9'
      ]
    }
  })
}
