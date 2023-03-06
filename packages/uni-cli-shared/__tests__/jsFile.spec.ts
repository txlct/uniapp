import {
  addMiniProgramPageJson,
  findChangedJsonFiles,
} from '../src/json/mp/jsonFile'

describe('miniProgram:jsonFile', () => {
  const filename = 'pages/index/index'
  test(`usingComponents`, () => {
    const usingComponents = {
      subscribe: 'plugin://subscribeMsg/subscribe',
      demo: '/components/demo/demo',
    }
    addMiniProgramPageJson(filename, {
      usingComponents,
      componentPlaceholder: Object.keys(usingComponents).reduce((acc, key) => ({
        ...acc,
        [key]: ''
      }), {})
    })
    expect(JSON.parse(findChangedJsonFiles().get(filename)!)).toEqual({
      usingComponents: {
        subscribe: 'plugin://subscribeMsg/subscribe',
        demo: '../../components/demo/demo',
      },
      componentPlaceholder: {
        subscribe: '',
        demo: '',
      }
    })
  })
})
