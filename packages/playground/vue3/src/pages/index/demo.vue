<template>
  <comp>
    from {{ name }}
  </comp>
</template>

<script>
// import comp from '@/components/comp/comp.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'demo',
  // components: {
  //   comp,
  // },

  componentPlaceholder: {
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