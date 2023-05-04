import {
  initCreateApp,
  initCreatePage,
  initCreateComponent,
  initCreatePluginApp,
  initCreateSubpackageApp,
} from '@dcloudio/uni-mp-core'

import '@dcloudio/uni-mp-polyfill'

import * as parseOptions from './parseOptions'

export const createApp = initCreateApp()
export const createPage = initCreatePage(parseOptions)
export const createComponent = initCreateComponent(parseOptions)
export const createPluginApp = initCreatePluginApp()
export const createSubpackageApp = initCreateSubpackageApp()
if (__PLATFORM__ === 'mp-weixin') {
  ;(wx as any).createApp = (global as any).createApp = createApp
  ;(wx as any).createPage = createPage
  ;(wx as any).createComponent = createComponent
  ;(wx as any).createPluginApp = (global as any).createPluginApp =
    createPluginApp
  ;(wx as any).createSubpackageApp = (global as any).createSubpackageApp =
    createSubpackageApp
}

export { getPluginInstance } from '@dcloudio/uni-mp-core';