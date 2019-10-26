<template>
  <section>
    <chart v-bind:sensor="'PM2_5'" v-bind:liveupdate="true"></chart>
  </section>
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