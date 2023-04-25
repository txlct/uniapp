const compiler = require('../lib')

function assertCodegen (template, generatedCode, ...args) {
  const compiled = compiler.compile(template, {
    mp: {
      platform: 'app-plus'
    },
    view: true,
    filterModules: ['swipe']
  })
  expect(compiled.render).toBe(generatedCode)
}

/* eslint-disable quotes */
describe('codegen', () => {
  it('generate directive', () => {
    assertCodegen(
      '<p v-custom1:[arg1].modifier="value1" v-custom2></p>',
      `with(this){return _c('p',{attrs:{"_i":0}})}`
    )
  })
  it('generate v-for directive', () => {
    assertCodegen(
      '<div><template v-for="item in items"><div></div><div></div></template></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_l((_$g(1,'f')),function(item,$10,$20,$30){return [_c('div',{key:item['k0'],attrs:{"_i":("2-"+$30)}}),_c('div',{key:item['k1'],attrs:{"_i":("3-"+$30)}})]})],2)}`
    )
    assertCodegen(
      '<div><template v-for="item in items"><span v-if="item.sub"></span></template></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_l((_$g(1,'f')),function(item,$10,$20,$30){return [(_$g(("2-"+$30),'i'))?_c('span',{key:item['k0'],attrs:{"_i":("2-"+$30)}}):_e()]})],2)}`
    )
  })
  it('generate events with multiple statements', () => {
    assertCodegen(
      '<div>A{{ d | e | f }}B{{text}}C</div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_v("A"+(_$g(0,'t0-0'))+"B"+(_$g(0,'t0-1'))+"C")])}`
    )
  })
  it('generate slot fallback content', () => {
    assertCodegen(
      '<div><slot><div>{{hi}}</div></slot></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_t("default",[_c('div',{attrs:{"_i":2}},[_v((_$g(2,'t0-0')))])],{"_i":1})],2)}`
    )
  })
  it('generate text with multiple statements', () => {
    assertCodegen(
      `<view>{{obj.param1}}123123{{obj.param1}}123123{{obj.param1}}<text> -{{obj.param3}}---{{obj.param3}} </text>{{obj.param2}}aaaa{{obj.param2}}aaaa{{obj.param2}}</view>`,
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v((_$g(0,'t0-0'))+"123123"+(_$g(0,'t0-1'))+"123123"+(_$g(0,'t0-2'))),_c('v-uni-text',{attrs:{"_i":1}},[_v("-"+(_$g(1,'t0-0'))+"---"+(_$g(1,'t0-1')))]),_v((_$g(0,'t2-0'))+"aaaa"+(_$g(0,'t2-1'))+"aaaa"+(_$g(0,'t2-2')))],1)}`
    )
  })
  it('generate v-slot', () => {
    assertCodegen(
      '<current-user v-slot="{ user }">{{ user.firstName }}</current-user>',
      `with(this){return _c('current-user',{attrs:{"_i":0},scopedSlots:_u([{key:"default",fn:function({ user }, _svm, _si){return [_v((_svm._$g(("0-"+_si),'t0-0')))]}}])})}`
    )
  })
  it('generate keep-alive', () => {
    assertCodegen(
      `<keep-alive exclude="componentWithStatus1"><component is="componentWithStatus"/></keep-alive>`,
      `with(this){return _c('keep-alive',{attrs:{"exclude":"componentWithStatus1","_i":0}},[_c("componentWithStatus",{tag:"component",attrs:{"_i":1}})],1)}`
    )
    assertCodegen(
      `<keep-alive :exclude="componentWithStatus1"><component :is="'componentWithStatus'+index"/></keep-alive>`,
      `with(this){return _c('keep-alive',{attrs:{"exclude":_$g(0,'a-exclude'),"_i":0}},[_c(_$g(1,'is'),{tag:"component",attrs:{"_i":1}})],1)}`
    )
  })
  it('generate wxs props', () => {
    assertCodegen(
      '<p :change:prop="swipe.sizeReady" :prop="pos" @touchstart="swipe.touchstart" @touchmove="swipe.touchmove" @touchend="swipe.touchend" @change="change"></p>',
      `with(this){return _c('p',{wxsProps:{"change:prop":"pos"},attrs:{"change:prop":swipe.sizeReady,"prop":_$gc(0,'change:pos'),"_i":0},on:{"touchstart":function($event){$event = $handleWxsEvent($event);swipe.touchstart($event, $getComponentDescriptor())},"touchmove":function($event){$event = $handleWxsEvent($event);swipe.touchmove($event, $getComponentDescriptor())},"touchend":function($event){$event = $handleWxsEvent($event);swipe.touchend($event, $getComponentDescriptor())},"change":function($event){return $handleViewEvent($event)}}})}`
    )
  })

  it('generate staticClass and id', () => {
    assertCodegen(
      '<custom id="id"></custom>',
      `with(this){return _c('custom',{attrs:{"id":"id","_i":0}})}`
    )
    assertCodegen(
      '<custom :id="id"></custom>',
      `with(this){return _c('custom',{attrs:{"id":_$g(0,'a-id'),"_i":0}})}`
    )
  })

  // TODO 后续优化dataset
  // it('generate dataset', () => {
  //   assertCodegen(
  //     '<view data-a="1" :data-b="b"></view>',
  //     `with(this){return _c('div',{attrs:{"_i":0}})}`
  //   )
  // })
  it('generate dataset', () => {
    assertCodegen(
      '<view data-a="1" :data-b="b"></view>',
      `with(this){return _c('uni-view',{attrs:{"data-a":"1","data-b":_$g(0,'a-data-b'),"_i":0}})}`
    )
    assertCodegen(
      '<custom data-a="1" :data-b="b"></custom>',
      `with(this){return _c('custom',{attrs:{"data-a":"1","data-b":_$g(0,'a-data-b'),"_i":0}})}`
    )
  })
  it('generate v-if directive', () => {
    assertCodegen(
      '<text v-if="a">1</text><text v-else-if="b">2</text><text v-else-if="c">3</text><text v-else>d</text>',
      `with(this){return (_$g(0,'i'))?_c('v-uni-text',{attrs:{"_i":0}},[_v("1")]):(_$g(1,'e'))?_c('v-uni-text',{attrs:{"_i":1}},[_v("2")]):(_$g(2,'e'))?_c('v-uni-text',{attrs:{"_i":2}},[_v("3")]):_c('v-uni-text',{attrs:{"_i":3}},[_v("d")])}`
    )
  })
  it('generate dynamic slot', () => {
    assertCodegen(
      '<base-layout><template v-slot:[dynamicSlotName]></template></base-layout>',
      `with(this){return _c('base-layout',{attrs:{"_i":0},scopedSlots:_u([{key:_$g(1,'st'),fn:function(_empty_, _svm, _si){return undefined}}],null,true)})}`
    )
  })
  it('generate ref', () => {
    assertCodegen(
      '<p :ref="component1"></p>',
      `with(this){return _c('p',{ref:_$g(0,'ref'),attrs:{"_i":0}})}`
    )
  })
  it('generate image', () => {
    assertCodegen(
      '<image :src="src"/>',
      `with(this){return _c('v-uni-image',{attrs:{"src":_$g(0,'a-src'),"_i":0}})}`
    )
    assertCodegen(
      '<image src="/static/logo.png"/>',
      `with(this){return _c('v-uni-image',{attrs:{"src":"/static/logo.png","_i":0}})}`
    )
    assertCodegen(
      '<image src="../static/logo.png"/>',
      `with(this){return _c('v-uni-image',{attrs:{"src":_$g(0,'a-src'),"_i":0}})}`
    )
    assertCodegen(
      '<image src="@/static/logo.png"/>',
      `with(this){return _c('v-uni-image',{attrs:{"src":"/static/logo.png","_i":0}})}`
    )
    assertCodegen(
      '<image src="~@/static/logo.png"/>',
      `with(this){return _c('v-uni-image',{attrs:{"src":"/static/logo.png","_i":0}})}`
    )
  })
  it('generate text trim', () => {
    assertCodegen(
      '<view>text</view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v("text")])}`
    )

    assertCodegen(
      '<view> text </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v("text")])}`
    )

    assertCodegen(
      '<text>{{line_one_cn+\' \'}}</text>',
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v((_$g(0,'t0-0')))])}`
    )

    assertCodegen(
      '<text>{{" "+line_one_cn}}</text>',
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v((_$g(0,'t0-0')))])}`
    )

    assertCodegen(
      '<text>\nN: {{title}}\n′</text>',
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v("N: "+(_$g(0,'t0-0'))+"\\n′")])}`
    )
    assertCodegen(
      '<text>我是第一行\n我的第二行</text>',
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v("我是第一行\\n我的第二行")])}`
    )
    assertCodegen(
      '<text>我是第一行\n我的第二行1{{title}}</text>',
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v("我是第一行\\n我的第二行1"+(_$g(0,'t0-0')))])}`
    )
    assertCodegen(
      `<text>我是第一行
  我的第二行2{{title}}</text>`,
      `with(this){return _c('v-uni-text',{attrs:{"_i":0}},[_v("我是第一行\\n  我的第二行2"+(_$g(0,'t0-0')))])}`
    )

    assertCodegen(
      '<view> text text </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v("text text")])}`
    )
    assertCodegen(
      '<view>text {{text}} text</view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v("text "+(_$g(0,'t0-0'))+" text")])}`
    )
    assertCodegen(
      '<view> text {{text}} 文本 </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v("text "+(_$g(0,'t0-0'))+" 文本")])}`
    )
    assertCodegen(
      '<view>{{text}} text  text </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v((_$g(0,'t0-0'))+" text  text")])}`
    )
    assertCodegen(
      '<view>  {{text}} text  text </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v((_$g(0,'t0-0'))+" text  text")])}`
    )
    assertCodegen(
      '<view>{{text}} text  text {{text}}</view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v((_$g(0,'t0-0'))+" text  text "+(_$g(0,'t0-1')))])}`
    )
    assertCodegen(
      '<view>  {{text}} text  text {{text}}  </view>',
      `with(this){return _c('uni-view',{attrs:{"_i":0}},[_v((_$g(0,'t0-0'))+" text  text "+(_$g(0,'t0-1')))])}`
    )
  })
  it('generate bool attr', () => {
    assertCodegen(
      '<video controls/>',
      `with(this){return _c('v-uni-video',{attrs:{"controls":true,"_i":0}})}`
    )
    assertCodegen(
      '<video controls=""/>',
      `with(this){return _c('v-uni-video',{attrs:{"controls":"","_i":0}})}`
    )
  })
})
/* eslint-enable quotes */
