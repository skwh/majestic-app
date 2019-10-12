<template>
  <div>
    <h1>Hello world!</h1>
    <p>Welcome to my node app! I am really excited because it all works now! Maybe it'll be faster now!</p>
    <chart v-bind:sensor="'PM2_5'"></chart>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';

export default {
  name: 'Home',
  components: { Chart }
}
</script>

<style lang="scss" scoped>

</style>