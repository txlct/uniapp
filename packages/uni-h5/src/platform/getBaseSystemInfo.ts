export const ua = navigator.userAgent

export const isAndroid = /android/i.test(ua)

export const isIOS = /iphone|ipad|ipod/i.test(ua)

export function getScreenFix() {
  return (
    /^Apple/.test(navigator.vendor) && typeof window.orientation === 'number'
  )
}

export function isLandscape(screenFix: boolean) {
  return screenFix && Math.abs(window.orientation as number) === 90
}

export function getScreenWidth(screenFix: boolean, landscape: boolean) {
  return screenFix
    ? Math[landscape ? 'max' : 'min'](screen.width, screen.height)
    : screen.width
}

export function getScreenHeight(screenFix: boolean, landscape: boolean) {
  return screenFix
    ? Math[landscape ? 'min' : 'max'](screen.height, screen.width)
    : screen.height
}

export function getWindowWidth(screenWidth: number) {
  return (
    Math.min(
      window.innerWidth,
      document.documentElement.clientWidth,
      screenWidth
    ) || screenWidth
  )
}

/**
 * 简易版systemInfo，主要为upx2px服务
 * @returns
 */
export function getBaseSystemInfo() {
  const screenFix = getScreenFix()
  const windowWidth = getWindowWidth(
    getScreenWidth(screenFix, isLandscape(screenFix))
  )
  return {
    platform: isIOS ? 'ios' : 'other',
    pixelRatio: window.devicePixelRatio,
    windowWidth,
  }
}
