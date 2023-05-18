<script lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    onLaunch(() => {
      console.log("App Launch");
    });
    onShow(() => {
      console.log("App Show");
    });
    onHide(() => {
      console.log("App Hide");
    });

    const goTo = (url = '') => {
      uni.navigateTo({ url });
    };

    return {
      goTo,
    };
  }
})
</script>

<style>
body {
  background-color: #fff;
}
</style>