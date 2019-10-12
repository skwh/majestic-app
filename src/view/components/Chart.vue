<script>
import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  data: () => ({
    chartdata: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'My First Dataset',
          backgroundColor: 'rgb(0, 0, 0, 0)',
          borderColor: 'rgb(99, 99, 132)',
          data: [
            0,
            20,
            30,
            40,
            50,
            60,
            75
          ],
        }],
      },
      options: {
        responsive: false,
        title: {
        display: true,
        text: 'Chart.js Line Chart'
        },
        scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
          display: true,
          labelString: 'Month'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
          display: true,
          labelString: 'Value'
          }
        }]
        }
      }
  }),
  mounted() {
    this.renderChart(this.chartdata, this.options)
  }
}
</script>

<style lang="sass">

</style>