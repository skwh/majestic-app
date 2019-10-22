<template>
  <div>
    <chart v-bind:sensor="this.sensor" v-bind:duration="this.duration" v-bind:liveupdate="this.liveupdate"></chart>
  </div>
</template>

<script>
import Chart from './Chart';

export default {
  components: { Chart },
  data() {
    return {

    }
  }
}
</script>