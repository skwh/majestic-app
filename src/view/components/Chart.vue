<script>
import { Line, mixins } from 'vue-chartjs';
const { reactiveData } = mixins
import Worker from '../workers/getUpdates.worker.js';
import { FixedLengthDoublyLinkedList } from '../util/fll.js';
import 'chartjs-plugin-streaming';

const LIST_MAX_LENGTH = 7;

const extractDataValues = function( messages, sensorName, value ) {
  if (messages === undefined || sensorName === undefined || value === undefined) return []; 
  return messages.toArray().filter((obj) => obj['sensorId'] === sensorName).map((obj) => obj[value]);
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
              duration: 600000,
              refresh: 1000,
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
        },
        tooltips: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }
      }
    }
  },
  methods: {
    makeChartDataObject () {
      this.chartData = {
        datasets: []
      }
    },
    setupWorker () {
      this.worker = new Worker();
      this.worker.onmessage = ( e ) => {
        if (!this.sensors[e.data.sensorId]) {
          this.addDataset( e.data.sensorId );
        }
        this.sensors[e.data.sensorId] = e.data;
      }
    },
    addDataset ( label ) {
      this.sensors[label] = { 'alive': true };
      this.chartData.datasets.push({
        label: label,
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
        data: []
      });
    },
    onRefresh ( chart ) {
      for (const dataset of this.chartData.datasets) {
        let data = this.sensors[dataset.label];
        let time = data['Time'];
        let value = data['PM2_5'];
        dataset.data.push({
          x: parseInt(time, 10),
          y: value
        });
      }
    }    
  },
  mounted() {
    if (this.liveupdate) {
      this.setupWorker();
      this.worker.postMessage('startup');
    }
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