<template>
  <div>
    <chart></chart>
  </div>
</template>

<script>
import Chart from './Chart';
import moment from 'moment';

export default {
  components: { Chart },
  data() {
    return {
    }
  },
  computed: {
    styles() {
      return {
        position: 'relative'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>