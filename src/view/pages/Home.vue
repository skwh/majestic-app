<template>
  <section>
    <chart v-bind:sensor="'PM2_5'" v-bind:liveupdate="true"></chart>
    <p>This is a test chart. The data displayed are random values and the dataset names do not correspond to real sensors.</p>
    <p>The chart displays values up to an hour ago. Each minute, it checks for new data and displays the new data.</p>
    <p>Let me know what you think!</p>
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