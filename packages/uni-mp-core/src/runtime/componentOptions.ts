import { isArray } from '@vue/shared'
import { ComponentInternalInstance, ComponentOptions, toRaw } from 'vue'

import {
  // @ts-ignore
  findComponentPropsData,
  // @ts-ignore
  invalidateJob,
  // @ts-ignore
  updateProps,
} from 'vue'

import { MPComponentInstance } from '..'

import { MPComponentOptions } from './component'

export function initData(_: ComponentOptions) {
  return {}
}

export function initPropsObserver(componentOptions: MPComponentOptions) {
  const observe = function observe(this: MPComponentInstance) {
    const up = this.properties.uP
    if (!up) {
      return
    }
    if (this.$vm) {
      updateComponentProps(up, this.$vm.$)
    } else if (this.properties.uT === 'm') {
      // 小程序组件
      updateMiniProgramComponentProperties(up, this)
    }
  }
  if (__PLATFORM__ === 'mp-weixin' || __PLATFORM__ === 'mp-qq') {
    if (!componentOptions.observers) {
      componentOptions.observers = {}
    }
    componentOptions.observers.uP = observe
  } else {
    ;(componentOptions.properties as any).uP.observer = observe
  }
}

function updateMiniProgramComponentProperties(
  up: string,
  mpInstance: MPComponentInstance
) {
  const prevProps = mpInstance.properties
  const nextProps = findComponentPropsData(up) || {}
  if (hasPropsChanged(prevProps, nextProps, false)) {
    mpInstance.setData(nextProps)
  }
}

export function updateComponentProps(
  up: string,
  instance: ComponentInternalInstance
) {
  const prevProps = toRaw(instance.props)
  const nextProps = findComponentPropsData(up) || {}
  if (hasPropsChanged(prevProps, nextProps)) {
    updateProps(instance, nextProps, prevProps, false)
    invalidateJob(instance.update)
    instance.update()
  }
}

function hasPropsChanged(
  prevProps: Data,
  nextProps: Data,
  checkLen: boolean = true
): boolean {
  const nextKeys = Object.keys(nextProps)
  if (checkLen && nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}

export function initBehaviors(
  vueOptions: ComponentOptions,
  initBehavior: (behavior: any) => string | { props: any }
): string[] {
  const vueBehaviors = vueOptions.behaviors
  const vueExtends = vueOptions.extends
  const vueMixins = vueOptions.mixins

  let vueProps = vueOptions.props

  if (!vueProps) {
    vueOptions.props = vueProps = []
  }

  const behaviors: string[] = []
  if (isArray(vueBehaviors)) {
    vueBehaviors.forEach((behavior) => {
      behaviors.push(behavior.replace('uni://', '__GLOBAL__://'))
      if (behavior === 'uni://form-field') {
        if (isArray(vueProps)) {
          vueProps.push('name')
          vueProps.push('value')
        } else {
          vueProps.name = {
            type: String,
            default: '',
          }
          vueProps.value = {
            type: [String, Number, Boolean, Array, Object, Date],
            default: '',
          }
        }
      }
    })
  }
  if (vueExtends && vueExtends.props) {
    const behavior = {}
    behaviors.push(initBehavior(behavior) as string)
  }
  if (isArray(vueMixins)) {
    vueMixins.forEach((vueMixin) => {
      if (vueMixin.props) {
        const behavior = {}
        behaviors.push(initBehavior(behavior) as string)
      }
    })
  }
  return behaviors
}

export function applyOptions(
  componentOptions: MPComponentOptions,
  vueOptions: ComponentOptions,
  initBehavior: (behavior: unknown) => string
) {
  componentOptions.data = initData(vueOptions)
  componentOptions.behaviors = initBehaviors(vueOptions, initBehavior)
}