import { ComponentPublicInstance } from 'vue'
import AsyncLoadingComponent from '../components/async-loading'
import AsyncErrorComponent from '../components/async-error'
import {
  initAppVm,
  initService,
  initView,
  defineGlobalData,
} from '@dcloudio/uni-core'


export function getApp() {
  let appVm: ComponentPublicInstance = (window as any).appVm 
  return appVm
}

export function initApp(vm: ComponentPublicInstance) {
  (window as any).appVm = vm
  let appVm: ComponentPublicInstance = (window as any).appVm 

  // 定制 App 的 $children 为 devtools 服务 __VUE_PROD_DEVTOOLS__
  Object.defineProperty((appVm.$ as any).ctx, '$children', {
    get() {
      return getCurrentPages().map((page) => page.$vm)
    },
  })

  const app = appVm.$.appContext.app
  if (!app.component(AsyncLoadingComponent.name)) {
    app.component(AsyncLoadingComponent.name, AsyncLoadingComponent)
  }
  if (!app.component(AsyncErrorComponent.name)) {
    app.component(AsyncErrorComponent.name, AsyncErrorComponent)
  }
  initAppVm(appVm)
  defineGlobalData(appVm)
  initService()
  initView()
}
