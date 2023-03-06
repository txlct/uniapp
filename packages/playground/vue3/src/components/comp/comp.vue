<template>
  <div>
    components:
    <slot />
    <inner-comp />
  </div>
</template>

<script lang="ts" setup>

</script>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  componentPlaceholder: {
    'inner-comp': 'view'
  }
});
</script>

