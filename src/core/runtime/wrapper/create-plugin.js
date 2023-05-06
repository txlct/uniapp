import 'uni-platform/runtime/index'

import {
  isFn
} from 'uni-shared'

import parseApp from 'uni-platform/runtime/wrapper/app-parser'

// 插件应用实例
let pluginVm = null;

export function createPlugin (vm) {
  const appOptions = parseApp(vm)

  pluginVm = vm;

  // 若当前vm无globalData，使用options中的globalData兼容
  if (!vm.globalData && appOptions.globalData) {
    vm.globalData = appOptions.globalData;
  }
  
  if (isFn(appOptions.onShow) && __GLOBAL__.onAppShow) {
    __GLOBAL__.onAppShow((...args) => {
      appOptions.onShow.apply(vm, args)
    })
  }
  if (isFn(appOptions.onHide) && __GLOBAL__.onAppHide) {
    __GLOBAL__.onAppHide((...args) => {
      appOptions.onHide.apply(vm, args)
    })
  }
  if (isFn(appOptions.onLaunch)) {
    const args = __GLOBAL__.getLaunchOptionsSync && __GLOBAL__.getLaunchOptionsSync()
    appOptions.onLaunch.call(vm, args)
  }
  return vm
}

// 小程序插件getApp获取当前vm实例
export const getPluginInstance = () => pluginVm;
