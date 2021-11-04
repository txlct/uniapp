import { assert } from './testUtils'

describe('mp-kuaishou: transform v-model', () => {
  test(`component v-model`, () => {
    assert(
      `<Comp v-model="model" />`,
      `<comp v-i="2a9ec0b0-0" bind:__l="__l" eO="{{a}}" modelValue="{{b}}" bindupdateModelValue="__e"/>`,
      `(_ctx, _cache) => {
  return { a: { 'updateModelValue': _o($event => _ctx.model = $event) }, b: _ctx.model }
}`
    )
  })
  test(`component v-model with cache`, () => {
    assert(
      `<Comp v-model="model" />`,
      `<comp v-i="2a9ec0b0-0" bind:__l="__l" eO="{{a}}" modelValue="{{b}}" bindupdateModelValue="__e"/>`,
      `(_ctx, _cache) => {
  return { a: { 'updateModelValue': _o($event => _ctx.model = $event) }, b: _ctx.model }
}`,
      {
        cacheHandlers: true,
      }
    )
  })
  test(`input,textarea v-model`, () => {
    assert(
      `<input v-model="model" />`,
      `<input data-e-o="{{a}}" value="{{b}}" bindinput="__e"/>`,
      `(_ctx, _cache) => {
  return { a: { 'input': _o($event => _ctx.model = $event.detail.value) }, b: _ctx.model }
}`
    )
    assert(
      `<textarea v-model="model" />`,
      `<textarea data-e-o="{{a}}" value="{{b}}" bindinput="__e"/>`,
      `(_ctx, _cache) => {
  return { a: { 'input': _o($event => _ctx.model = $event.detail.value) }, b: _ctx.model }
}`
    )
  })
  test(`input v-model + v-on`, () => {
    assert(
      `<input @input="input" v-model="model" />`,
      `<input bindinput="__e" data-e-o="{{a}}" value="{{b}}"/>`,
      `(_ctx, _cache) => {
  return { a: { 'input': _o([$event => _ctx.model = $event.detail.value, _ctx.input]) }, b: _ctx.model }
}`
    )
    assert(
      `<input v-model="model" @input="input" />`,
      `<input bindinput="__e" data-e-o="{{a}}" value="{{b}}"/>`,
      `(_ctx, _cache) => {
  return { a: { 'input': _o([$event => _ctx.model = $event.detail.value, _ctx.input]) }, b: _ctx.model }
}`
    )
  })
})