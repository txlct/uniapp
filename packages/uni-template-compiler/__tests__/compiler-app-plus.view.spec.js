const compiler = require('../lib')

function assertCodegen (template, generatedCode, ...args) {
  const compiled = compiler.compile(template, {
    mp: {
      platform: 'app-plus'
    },
    view: true
  })
  expect(compiled.render).toBe(generatedCode)
}

/* eslint-disable quotes */
describe('codegen', () => {
  it('generate directive', () => {
    assertCodegen(
      '<p v-custom1:arg1.modifier="value1" v-custom2></p>',
      `with(this){return _c('p',{attrs:{"_i":0}})}`
    )
    // extra
    assertCodegen(
      '<p v-custom1:[arg1].modifier="value1" v-custom2></p>',
      `with(this){return _c('p',{attrs:{"_i":0}})}`
    )
  })

  it('generate filters', () => {
    assertCodegen(
      '<div :id="a | b | c">{{ d | e | f }}</div>',
      `with(this){return _c('div',{attrs:{"id":_$g(0,'a-id'),"_i":0}},[_v((_$g(0,'t0-0')))])}`
    )
  })

  it('generate filters with no arguments', () => {
    assertCodegen(
      '<div>{{ d | e() }}</div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_v((_$g(0,'t0-0')))])}`
    )
  })

  it('generate v-for directive', () => {
    assertCodegen(
      '<div><li v-for="item in items" :key="item.uid"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},_l((_$g(1,'f')),function(item,$10,$20,$30){return _c('li',{key:item,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
    // iterator syntax
    assertCodegen(
      '<div><li v-for="(item, i) in items"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},_l((_$g(1,'f')),function(item,i,$20,$30){return _c('li',{key:item,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
    assertCodegen(
      '<div><li v-for="(item, key, index) in items"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},_l((_$g(1,'f')),function(item,key,index,$30){return _c('li',{key:item,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
    // destructuring
    assertCodegen(
      '<div><li v-for="{ a, b } in items"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},_l((_$g(1,'f')),function($item,$10,$20,$30){return _c('li',{key:$item,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
    assertCodegen(
      '<div><li v-for="({ a, b }, key, index) in items"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},_l((_$g(1,'f')),function($item,key,index,$30){return _c('li',{key:$item,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
    // v-for with extra element
    assertCodegen(
      '<div><p></p><li v-for="item in items"></li></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_c('p',{attrs:{"_i":1}}),_l((_$g(2,'f')),function(item,$10,$20,$30){return _c('li',{key:item,attrs:{"_i":("2-"+$30)}})})],2)}`
    )
  })

  it('generate v-if directive', () => {
    assertCodegen(
      '<p v-if="show">hello</p>',
      `with(this){return (_$g(0,'i'))?_c('p',{attrs:{"_i":0}},[_v("hello")]):_e()}`
    )
  })

  it('generate v-else directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else>world</p></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[(_$g(1,'i'))?_c('p',{attrs:{"_i":1}},[_v("hello")]):_c('p',{attrs:{"_i":2}},[_v("world")])],1)}`
    )
  })

  it('generate v-else-if directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else-if="hide">world</p></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[(_$g(1,'i'))?_c('p',{attrs:{"_i":1}},[_v("hello")]):(_$g(2,'e'))?_c('p',{attrs:{"_i":2}},[_v("world")]):_e()],1)}`
    )
  })

  it('generate v-else-if with v-else directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else-if="hide">world</p><p v-else>bye</p></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[(_$g(1,'i'))?_c('p',{attrs:{"_i":1}},[_v("hello")]):(_$g(2,'e'))?_c('p',{attrs:{"_i":2}},[_v("world")]):_c('p',{attrs:{"_i":3}},[_v("bye")])],1)}`
    )
  })

  it('generate multi v-else-if with v-else directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else-if="hide">world</p><p v-else-if="3">elseif</p><p v-else>bye</p></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[(_$g(1,'i'))?_c('p',{attrs:{"_i":1}},[_v("hello")]):(_$g(2,'e'))?_c('p',{attrs:{"_i":2}},[_v("world")]):(3)?_c('p',{attrs:{"_i":3}},[_v("elseif")]):_c('p',{attrs:{"_i":4}},[_v("bye")])],1)}`
    )
  })

  it('generate ref', () => {
    assertCodegen(
      '<p ref="component1"></p>',
      `with(this){return _c('p',{ref:"component1",attrs:{"_i":0}})}`
    )
  })

  it('generate ref on v-for', () => {
    assertCodegen(
      '<ul><li v-for="item in items" ref="component1"></li></ul>',
      `with(this){return _c('ul',{attrs:{"_i":0}},_l((_$g(1,'f')),function(item,$10,$20,$30){return _c('li',{key:item,ref:"component1",refInFor:true,attrs:{"_i":("1-"+$30)}})}),1)}`
    )
  })

  it('generate v-bind directive', () => {
    assertCodegen(
      '<p v-bind="test"></p>',
      `with(this){return _c('p',_b({attrs:{"_i":0}},'p',_$g(0,'v-bind'),false))}`
    )
  })

  it('generate v-bind with prop directive', () => {
    assertCodegen(
      '<p v-bind.prop="test"></p>',
      `with(this){return _c('p',_b({attrs:{"_i":0}},'p',_$g(0,'v-bind'),true))}`
    )
  })

  it('generate v-bind directive with sync modifier', () => {
    assertCodegen(
      '<p v-bind.sync="test"></p>',
      `with(this){return _c('p',_b({attrs:{"_i":0}},'p',_$g(0,'v-bind'),false,true))}`
    )
  })

  it('generate v-model directive', () => {
    assertCodegen(
      '<input v-model="test">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},model:{value:_$g(0,'v-model'),callback:function($$v){$handleVModelEvent(0,$$v)},expression:"test"}})}`
    )
  })

  it('generate multiline v-model directive', () => {
    assertCodegen(
      '<input v-model="\n test \n">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},model:{value:_$g(0,'v-model'),callback:function($$v){$handleVModelEvent(0,$$v)},expression:"\\n test \\n"}})}`
    )
  })

  it('generate multiline v-model directive on custom component', () => {
    assertCodegen(
      '<my-component v-model="\n test \n" />',
      `with(this){return _c('my-component',{attrs:{"_i":0},model:{value:_$g(0,'v-model'),callback:function(){},expression:"\\n test \\n"}})}`
    )
  })

  it('generate template tag', () => {
    assertCodegen(
      '<div><template><p>{{hello}}</p></template></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[[_c('p',{attrs:{"_i":2}},[_v((_$g(2,'t0-0')))])]],2)}`
    )
  })

  it('generate single slot', () => {
    assertCodegen(
      '<div><slot></slot></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_t("default",null,{"_i":1})],2)}`
    )
  })

  it('generate named slot', () => {
    assertCodegen(
      '<div><slot name="one"></slot></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_t("one",null,{"_i":1})],2)}`
    )
    assertCodegen(
      '<div><slot :name="one"></slot></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_t(_$g(1,'name'),null,{"_i":1})],2)}`
    )
  })

  it('generate slot fallback content', () => {
    assertCodegen(
      '<div><slot><div>hi</div></slot></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_t("default",[_c('div',{attrs:{"_i":2}},[_v("hi")])],{"_i":1})],2)}`
    )
  })

  it('generate slot target', () => {
    assertCodegen(
      '<p slot="one">hello world</p>',
      `with(this){return _c('p',{attrs:{"slot":"one","_i":0},slot:"one"},[_v("hello world")])}`
    )
  })

  it('generate scoped slot', () => {
    assertCodegen(
      '<foo><template slot-scope="bar">{{ bar }}</template></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"default",fn:function(bar, _svm, _si){return [_v((_svm._$g(("1-"+_si),'t0-0')))]}}])})}`
    )
    assertCodegen(
      '<foo><div slot-scope="bar">{{ bar }}</div></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"default",fn:function(bar, _svm, _si){return _c('div',{attrs:{"_i":("1-"+_si)}},[_v((_svm._$g(("1-"+_si),'t0-0')))])}}])})}`
    )
  })

  it('generate named scoped slot', () => {
    assertCodegen(
      '<foo><template slot="foo" slot-scope="bar">{{ bar }}</template></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"foo",fn:function(bar, _svm, _si){return [_v((_svm._$g(("1-"+_si),'t0-0')))]}}])})}`
    )
    assertCodegen(
      '<foo><div slot="foo" slot-scope="bar">{{ bar }}</div></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"foo",fn:function(bar, _svm, _si){return _c('div',{attrs:{"_i":("1-"+_si)}},[_v((_svm._$g(("1-"+_si),'t0-0')))])}}])})}`
    )
  })

  it('generate dynamic scoped slot', () => {
    assertCodegen(
      '<foo><template :slot="foo" slot-scope="bar">{{ bar }}</template></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:_$g(1,'st'),fn:function(bar, _svm, _si){return [_v((_svm._$g(("1-"+_si),'t0-0')))]}}],null,true)})}`
    )
  })

  it('generate scoped slot with multiline v-if', () => {
    assertCodegen(
      '<foo><template v-if="\nshow\n" slot-scope="bar">{{ bar }}</template></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"default",fn:function(bar, _svm, _si){return (_svm._$g(("1-"+_si),'i'))?[_v((_svm._$g(("1-"+_si),'t0-0')))]:undefined}}],null,true)})}`
    )
    assertCodegen(
      '<foo><div v-if="\nshow\n" slot="foo" slot-scope="bar">{{ bar }}</div></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([{key:"foo",fn:function(bar, _svm, _si){return (_svm._$g(("1-"+_si),'i'))?_c('div',{attrs:{"_i":("1-"+_si)}},[_v((_svm._$g(("1-"+_si),'t0-0')))]):_e()}}],null,true)})}`
    )
  })

  it('generate scoped slot with new slot syntax', () => {
    assertCodegen(
      '<foo><template v-if="show" #default="bar">{{ bar }}</template></foo>',
      `with(this){return _c('foo',{attrs:{"_i":0},scopedSlots:_u([(_$g(1,'i'))?{key:"default",fn:function(bar, _svm, _si){return [_v((_svm._$g(("1-"+_si),'t0-0')))]}}:null],null,true)})}`
    )
  })

  it('generate class binding', () => {
    // static
    assertCodegen(
      '<p class="class1">hello world</p>',
      `with(this){return _c('p',{staticClass:_$g(0,'sc'),attrs:{"_i":0}},[_v("hello world")])}`
    )
    // dynamic
    assertCodegen(
      '<p :class="class1">hello world</p>',
      `with(this){return _c('p',{class:_$g(0,'c'),attrs:{"_i":0}},[_v("hello world")])}`
    )
  })

  it('generate style binding', () => {
    assertCodegen(
      '<p :style="error">hello world</p>',
      `with(this){return _c('p',{style:(_$g(0,'s')),attrs:{"_i":0}},[_v("hello world")])}`
    )
  })

  it('generate v-show directive', () => {
    assertCodegen(
      '<p v-show="shown">hello world</p>',
      `with(this){return _c('p',{directives:[{name:"show",rawName:"v-show",value:(_$g(0,'v-show')),expression:"_$g(0,'v-show')"}],attrs:{"_i":0}},[_v("hello world")])}`
    )
  })

  it('generate DOM props with v-bind directive', () => {
    // input + value
    assertCodegen(
      '<input :value="msg">',
      `with(this){return _c('v-uni-input',{attrs:{"value":_$g(0,'a-value'),"_i":0}})}`
    )
    // non input
    assertCodegen(
      '<p :value="msg"/>',
      `with(this){return _c('p',{attrs:{"value":_$g(0,'a-value'),"_i":0}})}`
    )
  })

  it('generate attrs with v-bind directive', () => {
    assertCodegen(
      '<input :name="field1">',
      `with(this){return _c('v-uni-input',{attrs:{"name":_$g(0,'a-name'),"_i":0}})}`
    )
  })

  it('generate static attrs', () => {
    assertCodegen(
      '<input name="field1">',
      `with(this){return _c('v-uni-input',{attrs:{"name":"field1","_i":0}})}`
    )
  })

  it('generate events with v-on directive', () => {
    assertCodegen(
      '<input @input="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
  })

  it('generate events with method call', () => {
    assertCodegen(
      '<input @input="onInput($event);">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // empty arguments
    assertCodegen(
      '<input @input="onInput();">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // without semicolon
    assertCodegen(
      '<input @input="onInput($event)">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // multiple args
    assertCodegen(
      '<input @input="onInput($event, \'abc\', 5);">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // expression in args
    assertCodegen(
      '<input @input="onInput($event, 2+2);">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // tricky symbols in args
    assertCodegen(
      `<input @input="onInput(');[\\'());');">`,
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // function name including a `function` part (#9920)
    // 2.6.10 暂未修复此 bug
    // assertCodegen(
    //   '<input @input="functionName()">',
    //   `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return functionName()}}})}`
    // )
  })

  it('generate events with multiple statements', () => {
    // normal function
    assertCodegen(
      '<input @input="onInput1();onInput2()">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // function with multiple args
    assertCodegen(
      '<input @input="onInput1($event, \'text\');onInput2(\'text2\', $event)">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
  })

  it('generate events with keycode', () => {
    assertCodegen(
      '<input @input.enter="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"enter":true})}}})}`
    )
    // multiple keycodes (delete)
    assertCodegen(
      '<input @input.delete="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"delete":true})}}})}`
    )
    // multiple keycodes (esc)
    assertCodegen(
      '<input @input.esc="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"esc":true})}}})}`
    )
    // multiple keycodes (space)
    assertCodegen(
      '<input @input.space="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"space":true})}}})}`
    )
    // multiple keycodes (chained)
    assertCodegen(
      '<input @keydown.enter.delete="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"keydown":function($event){return $handleViewEvent($event,{"enter":true,"delete":true})}}})}`
    )
    // number keycode
    assertCodegen(
      '<input @input.13="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"13":true})}}})}`
    )
    // custom keycode
    assertCodegen(
      '<input @input.custom="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"custom":true})}}})}`
    )
  })

  it('generate events with generic modifiers', () => {
    assertCodegen(
      '<input @input.stop="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"stop":true})}}})}`
    )
    assertCodegen(
      '<input @input.prevent="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"prevent":true})}}})}`
    )
    assertCodegen(
      '<input @input.self="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"self":true})}}})}`
    )
  })

  // GitHub Issues #5146
  it('generate events with generic modifiers and keycode correct order', () => {
    assertCodegen(
      '<input @keydown.enter.prevent="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"keydown":function($event){return $handleViewEvent($event,{"enter":true,"prevent":true})}}})}`
    )

    assertCodegen(
      '<input @keydown.enter.stop="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"keydown":function($event){return $handleViewEvent($event,{"enter":true,"stop":true})}}})}`
    )
  })

  it('generate events with mouse event modifiers', () => {
    assertCodegen(
      '<input @click.ctrl="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"ctrl":true})}}})}`
    )
    assertCodegen(
      '<input @click.shift="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"shift":true})}}})}`
    )
    assertCodegen(
      '<input @click.alt="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"alt":true})}}})}`
    )
    assertCodegen(
      '<input @click.meta="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"meta":true})}}})}`
    )
    assertCodegen(
      '<input @click.exact="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"exact":true})}}})}`
    )
    assertCodegen(
      '<input @click.ctrl.exact="onClick">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"click":function($event){return $handleViewEvent($event,{"ctrl":true,"exact":true})}}})}`
    )
  })

  it('generate events with multiple modifiers', () => {
    assertCodegen(
      '<input @input.stop.prevent.self="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"stop":true,"prevent":true,"self":true})}}})}`
    )
  })

  it('generate events with capture modifier', () => {
    assertCodegen(
      '<input @input.capture="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"!input":function($event){return $handleViewEvent($event,{"capture":true})}}})}`
    )
  })

  it('generate events with once modifier', () => {
    assertCodegen(
      '<input @input.once="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"~input":function($event){return $handleViewEvent($event,{"once":true})}}})}`
    )
  })

  it('generate events with capture and once modifier', () => {
    assertCodegen(
      '<input @input.capture.once="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"~!input":function($event){return $handleViewEvent($event,{"once":true,"capture":true})}}})}`
    )
  })

  it('generate events with once and capture modifier', () => {
    assertCodegen(
      '<input @input.once.capture="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"~!input":function($event){return $handleViewEvent($event,{"once":true,"capture":true})}}})}`
    )
  })

  it('generate events with inline statement', () => {
    assertCodegen(
      '<input @input="current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
  })

  it('generate events with inline function expression', () => {
    // normal function
    assertCodegen(
      '<input @input="function () { current++ }">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // normal named function
    assertCodegen(
      '<input @input="function fn () { current++ }">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // arrow with no args
    assertCodegen(
      '<input @input="()=>current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // arrow with parens, single arg
    assertCodegen(
      '<input @input="(e) => current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // arrow with parens, multi args
    assertCodegen(
      '<input @input="(a, b, c) => current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // arrow with destructuring
    assertCodegen(
      '<input @input="({ a, b }) => current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // arrow single arg no parens
    assertCodegen(
      '<input @input="e=>current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
    // with modifiers
    assertCodegen(
      `<input @keyup.enter="e=>current++">`,
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"keyup":function($event){return $handleViewEvent($event,{"enter":true})}}})}`
    )
  })

  // #3893
  it('should not treat handler with unexpected whitespace as inline statement', () => {
    assertCodegen(
      '<input @input=" onInput ">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`
    )
  })

  it('generate unhandled events', () => {
    assertCodegen(
      '<input @input="current++">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event)}}})}`,
      ast => {
        ast.events.input = undefined
      }
    )
  })

  it('generate multiple event handlers', () => {
    assertCodegen(
      '<input @input="current++" @input.stop="onInput">',
      `with(this){return _c('v-uni-input',{attrs:{"_i":0},on:{"input":function($event){return $handleViewEvent($event,{"stop":true})}}})}`
    )
  })

  it('generate component', () => {
    assertCodegen(
      '<my-component name="mycomponent1" :msg="msg" @notify="onNotify"><div>hi</div></my-component>',
      `with(this){return _c('my-component',{attrs:{"_i":0},on:{"notify":function($event){return $handleViewEvent($event)}}},[_c('div',{attrs:{"_i":1}},[_v("hi")])],1)}`
    )
  })

  it('generate svg component with children', () => {
    assertCodegen(
      '<svg><my-comp><circle :r="10"></circle></my-comp></svg>',
      `with(this){return _c('svg',{attrs:{"_i":0}},[_c('my-comp',{attrs:{"_i":1}},[_c('circle',{attrs:{"_i":2}})],1)],1)}`
    )
  })

  it('generate is attribute', () => {
    assertCodegen(
      '<div is="component1"></div>',
      `with(this){return _c("component1",{tag:"div",attrs:{"_i":0}})}`
    )
    assertCodegen(
      '<div :is="component1"></div>',
      `with(this){return _c(_$g(0,'is'),{tag:"div",attrs:{"_i":0}})}`
    )
    // maybe a component and normalize type should be 1
    assertCodegen(
      '<div><div is="component1"></div></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_c("component1",{tag:"div",attrs:{"_i":1}})],1)}`
    )
  })

  it('generate component with inline-template', () => {
    // have "inline-template'"
    assertCodegen(
      '<my-component inline-template><p><span>hello world</span></p></my-component>',
      `with(this){return _c('my-component',{attrs:{"_i":0},inlineTemplate:{render:function(){with(this){return _c('p',{attrs:{"_i":1}},[_c('span',{attrs:{"_i":2}},[_v("hello world")])],1)}},staticRenderFns:[]}})}`
    )
    // "have inline-template attrs, but not having exactly one child element
    assertCodegen(
      '<my-component inline-template><hr><hr></my-component>',
      `with(this){return _c('my-component',{attrs:{"_i":0},inlineTemplate:{render:function(){with(this){return _c('hr',{attrs:{"_i":1}})}},staticRenderFns:[]}})}`
    )
    assertCodegen(
      '<my-component inline-template></my-component>',
      `with(this){return _c('my-component',{attrs:{"_i":0}})}`
    )
    // have "is" attribute
    assertCodegen(
      '<div is="myComponent" inline-template><div></div></div>',
      `with(this){return _c("myComponent",{tag:"div",attrs:{"_i":0},inlineTemplate:{render:function(){with(this){return _c('div',{attrs:{"_i":1}})}},staticRenderFns:[]}})}`
    )
    assertCodegen(
      '<div is="myComponent" inline-template></div>',
      `with(this){return _c("myComponent",{tag:"div",attrs:{"_i":0}})}`
    )
    // expect('Inline-template components must have exactly one child element.').toHaveBeenWarned()
    // expect(console.error.calls.count()).toBe(3)
  })

  it('generate static trees inside v-for', () => {
    assertCodegen(
      `<div><div v-for="i in 10"><p><span></span></p></div></div>`,
      `with(this){return _c('div',{attrs:{"_i":0}},_l((10),function(i,$10,$20,$30){return _c('div',{attrs:{"_i":("1-"+$30)}},[_c('p',{attrs:{"_i":("2-"+$30)}},[_c('span',{attrs:{"_i":("3-"+$30)}})],1)],1)}),1)}`
      // [`with(this){return _c('p',{attrs:{"_i":("2-"+$i)}},[_c('p',{attrs:{"_i":("3-"+$i)}})])}`]
    )
  })

  it('generate component with v-for', () => {
    // normalize type: 2
    assertCodegen(
      '<div><child></child><template v-for="item in list">{{ item }}</template></div>',
      `with(this){return _c('div',{attrs:{"_i":0}},[_c('child',{attrs:{"_i":1}}),_l((_$g(2,'f')),function(item,$10,$20,$30){return [_v((_$g(("2-"+$30),'t0-0')))]})],2)}`
    )
  })

  // it('generate component with comment', () => {
  //   const options = extend({
  //     comments: true
  //   }, baseOptions)
  //   const template = '<div><!--comment--></div>'
  //   const generatedCode = `with(this){return _c('p',{attrs:{"_i":0}})}`

  //   const ast = parse(template, options)
  //   optimize(ast, options)
  //   const res = generate(ast, options)
  //   expect(res.render).toBe(generatedCode)
  // })

  // #6150
  // it('generate comments with special characters', () => {
  //   const options = extend({
  //     comments: true
  //   }, baseOptions)
  //   const template = '<div><!--\n\'comment\'\n--></div>'
  //   const generatedCode = `with(this){return _c('p',{attrs:{"_i":0}})}`

  //   const ast = parse(template, options)
  //   optimize(ast, options)
  //   const res = generate(ast, options)
  //   expect(res.render).toBe(generatedCode)
  // })

  // #8041
  it('does not squash templates inside v-pre', () => {
    assertCodegen(
      '<div v-pre><template><p>{{msg}}</p></template></div>',
      `with(this){return _c('div',{pre:true,attrs:{"_i":0}},[[_c('p',{pre:true,attrs:{"_i":2}},[_v("{{msg}}")])]],2)}`
    )
    // const template = '<div v-pre><template><p>{{msg}}</p></template></div>'
    // const generatedCode = `with(this){return _m(0)}`
    // // const renderFn = `with(this){return _c('p',{pre:true},[_c('template',[_c('p',[_v("{{msg}}")])])],2)}`
    // const ast = parse(template, baseOptions)
    // optimize(ast, baseOptions)
    // const res = generate(ast, baseOptions)
    // expect(res.render).toBe(generatedCode)
    // // expect(res.staticRenderFns).toEqual([renderFn])
  })

  it('not specified ast type', () => {
    assertCodegen(
      '',
      `with(this){return _c("div")}`
    )
    // const res = generate(null, baseOptions)
    // expect(res.render).toBe(`with(this){return _c("p")}`)
    // expect(res.staticRenderFns).toEqual([])
  })

  it('not specified directives option', () => {
    assertCodegen(
      '<p v-if="show">hello world</p>',
      `with(this){return (_$g(0,'i'))?_c('p',{attrs:{"_i":0}},[_v("hello world")]):_e()}`, {
        // isReservedTag
      }
    )
  })

  // #9142
  it('should compile single v-for component inside template', () => {
    assertCodegen(
      `<div><template v-if="ok"><foo v-for="i in 1" :key="i"></foo></template></div>`,
      `with(this){return _c('div',{attrs:{"_i":0}},[(_$g(1,'i'))?_l((1),function(i,$10,$20,$30){return _c('foo',{key:i,attrs:{"_i":("2-"+$30)}})}):_e()],2)}`
    )
  })
})
/* eslint-enable quotes */
