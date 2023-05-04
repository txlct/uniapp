<template>
  plugin demo

  to demo 
  <button @click="goto">to demo</button>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    console.log('--------- getApp():>>>', getApp());
    console.log('--------- getApp().globalData:>>>', getApp().globalData);

    const goto = () => {
      getApp().goTo('/pages/index/demo');
    };

    getApp().globalData.test = 'update'

    console.log('--------- getApp().globalData:>>>', getApp().globalData);
    
    return {
      goto
    };
  }
})
</script>