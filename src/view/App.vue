<template>
  <div id="app">
    <h1>Hello world!</h1>
    <p>Welcome to my node app! I am really excited because it all works now! Maybe it'll be faster now!</p>
    <chart :chartdata="this.chartdata"></chart>
  </div>
</template>

<script>
import Chart from './components/Chart.vue';

export default {
  name: 'app',
  components: {
    Chart
  }
}
</script>

<style lang="scss">
#app {
  h1 {
    text-transform: uppercase;
  }
  p {
    font-size: 1.25em;
  }
  canvas {
    width: 75%;
    display: block;
  }
}
</style>