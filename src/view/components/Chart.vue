<script>
import { Line, mixins } from 'vue-chartjs';
import Axios from "axios";
const { reactiveData } = mixins
import 'chartjs-plugin-streaming';

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
    start: Number,
    end: Number,
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
              duration: 60000,
              refresh: 10000,
              delay: 2000,
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
      animation: {
        duration: 0
      },
      hover: {
          animationDuration: 0
      },
      responsiveAnimationDuration: 0
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
      Axios.get('/api/sensor/all').then(response => {
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
        console.log("updated chart with new data from endpoint");
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