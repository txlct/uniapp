<template>
  <comp>
    from {{ name }}
  </comp>
  <vod-video></vod-video>
  <test></test>
</template>

<script>
import { defineComponent, ref } from 'vue';
import comp from '@/components/inner-comp/inner-comp.vue';

export default defineComponent({
  name: 'demo',
  // components: {
  //   comp,
  // },

  components: {
    comp,
    'vod-video': 'plugin://vodVideo/player',
    'test': 'plugin'
  },

  componentPlaceholder: {
    'vod-video': 'view',
    comp: 'button'
  },

  setup() {
    const name = ref('demo');

    return {
      name,
    };
  }
});
</script>