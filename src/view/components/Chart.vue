<script>
import { Line, mixins } from 'vue-chartjs';
const { reactiveData } = mixins
import Axios from "axios";
import 'chartjs-plugin-streaming';
import ApiRoutes from '../api';

const randMax = (max) => {
  return Math.floor(Math.random() * max) + 1;
}

const randomColor = () => {
  return `rgb(${randMax(255)}, ${randMax(255)}, ${randMax(255)})`;
}

export default {
  extends: Line,
  props: {
    liveupdate: Boolean,
    duration: Number,
    sensor: {
      validator: function (value) {
        return ['PM1_0', 'PM2_5', 'PM10'].indexOf(value) !== -1;
      }
    }
  },
  mixins: [ reactiveData ],
  data() {
    return {
      sensors: {},
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            type: 'realtime',
            realtime: {
              duration: this.duration || process.env.CHART_DEFAULT_TIME_SPAN,
              refresh: process.env.CHART_DEFAULT_REFRESH_RATE,
              delay: process.env.CHART_DEFAULT_DELAY,
              onRefresh: this.onRefresh
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'ug/m^3'
            }
          }]
        }
      },
      // animation: {
      //   duration: 0
      // },
      // hover: {
      //     animationDuration: 0
      // },
      // responsiveAnimationDuration: 0
    }
  },
  methods: {
    makeChartDataObject () {
      this.chartData = {
        datasets: []
      }
    },
    parseResponse( response ) {
      let data = response.data.data;
      data.forEach((val) => {
        let sensorId = val['sensorId'];
        if (!this.sensors[sensorId]) {
          this.addDataset(sensorId);
        }
        this.sensors[sensorId] = val;
      });
    },
    addDataset ( label ) {
      this.sensors[label] = true;
      this.chartData.datasets.push({
        label: label,
        borderColor: randomColor(),
        fill: false,
        data: []
      });
    },
    onRefresh ( chart ) {
      Axios.get(ApiRoutes.REALTIME_ENDPOINT).then(response => {
        this.parseResponse(response);
        for (const dataset of chart.data.datasets) {
          let data = this.sensors[dataset.label];
          let time = data['Time'];
          let value = data['PM2_5'];
          dataset.data.push({
            x: time,
            y: value
          });
          chart.update();
        }
      }).catch((err) => {
        console.error(err);
      });
    }    
  },
  mounted() {
    this.makeChartDataObject();
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData() {
      this.$data._chart.update();
    }
  }
}
</script>

<style lang="sass">

</style>