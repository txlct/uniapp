import { ComponentPublicInstance } from 'vue'
import { initAppLifecycle, parseApp, ParseAppOptions } from './app'

// 全局插件应用实例
let pluginInstance: ComponentPublicInstance | null = null;

export function initCreatePluginApp(parseAppOptions?: ParseAppOptions) {
  return function createApp(vm: ComponentPublicInstance) {
    pluginInstance = vm;

    initAppLifecycle(parseApp(vm, parseAppOptions), vm)
    if (process.env.UNI_MP_PLUGIN) {
      __GLOBAL__.$vm = vm
    }
  }
}

export const getPluginInstance = () => pluginInstance;