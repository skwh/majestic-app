<script>
import { Line, mixins } from 'vue-chartjs';
const { reactiveData, reactiveProp } = mixins
import Axios from "axios";
import 'chartjs-plugin-streaming';
import ApiRoutes from '../api';
import moment from 'moment';

const CHART_DEFAULT_TIME_SPAN = 3600000;
const CHART_DEFAULT_REFRESH_RATE = 60000;
const CHART_DEFAULT_DELAY = 5000;

const randMax = (max) => Math.floor(Math.random() * max) + 1;
const randomColor = () => `rgb(${randMax(255)}, ${randMax(255)}, ${randMax(255)})`;

export default {
  extends: Line,
  props: {
    liveupdate: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: Object,
      default: () => moment().subtract(1, 'hours'),
    },
    endTime: {
      type: Object,
      default: () => moment()
    },
    inputSensors: {
      type: Array,
      default: () => []
    },
    instrument: {
      type: String,
      default: 'PM2_5',
      validator: (value) => {
        return ['Temp', 'Hmdty', 'Press', 'PM1_0', 'PM2_5', 'PM10', 'WS', 'WD'].indexOf(value) != -1;
      }
    }
  },
  mixins: [ reactiveData ],
  data() {
    return {
      duration: this.updateDuration(),
      sensors: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'realtime',
            realtime: {
              duration: this.duration || CHART_DEFAULT_TIME_SPAN,
              refresh: CHART_DEFAULT_REFRESH_RATE,
              delay: CHART_DEFAULT_DELAY,
              onRefresh: this.onRefresh
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'µg/m^3'
            }
          }]
        },
      },
    }
  },
  methods: {
    updateDuration () {
      this.duration = moment.duration(moment(this.endTime).diff(moment(this.startTime))).asMilliseconds();
    },
    makeChartDataObject () {
      this.chartData = {
        datasets: []
      };
    },
    parseRealtimeResponse( response ) {
      let data = response.data.data;
      data.forEach((d) => {
        if (!this.hasSensorId(d)) {
          this.newSensorId(d)
        }
        this.addDataPoint(d.canary_message);
      });
    },
    hasSensorId( datum ) {
      return this.sensors[datum.canary_message.source_device] !== undefined;
    },
    newSensorId( datum ) {
      this.sensors[datum.canary_message.source_device] = datum.sensor_color;
      this.chartData.datasets.push({
        label : datum.canary_message.source_device,
        borderColor: datum.sensor_color,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        data: []
      });
      this.$data._chart.update();
    },
    parseRecentResponse( response ) {
      let data = response.data.data;
      data.forEach(d => {
        this.addDataPoint(d.canary_message);
      });
      this.$data._chart.update();
      this.renderChart(this.chartData, this.options);
    },
    addDataPoint( canary_message ) {
      let point = canary_message[this.instrument];
      for (let i = 0; i < this.chartData.datasets.length; i++) {
        let current_dataset = this.chartData.datasets[i];
        if (current_dataset.label === canary_message.source_device) {
          current_dataset.data.push({
            x : canary_message.Time,
            y : point
          });
          this.$data._chart.update();
          break;
        }
      }
    },
    onRefresh ( chart ) {
      Axios.get(ApiRoutes.REALTIME_ENDPOINT).then((res) => {
        this.parseRealtimeResponse(res);
      });
    },
    getRecentData() {
      Axios.get(ApiRoutes.DATA_ENDPOINT + ApiRoutes.RECENT_REALTIME_QUERY(this.startTime.toISOString(), 
                                                                          this.endTime.toISOString(), 
                                                                          this.instrument, 
                                                                          this.inputSensors),
                                                                          { headers: { 'Accept' : 'application/json' }})
      .then((res) => {
        this.parseRecentResponse(res);
      });
    },
    getAllSensors() {
      Axios.get(ApiRoutes.ALL_SENSORS_ENDPOINT)
      .then((res) => {
        let data = res.data.data;
        data.forEach(d => {
          this.sensors[d.sensor_id] = d.sensor_color;
          this.chartData.datasets.push({
            label : d.sensor_id, 
            borderColor: d.sensor_color,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            data: []
          });
        });
        this.$data._chart.update();
        this.getRecentData();
      })
    }    
  },
  mounted() {
    this.makeChartDataObject();
    this.getAllSensors();
  },
  watch: {
    chartData() {
      this.$data._chart.update();
    },
    startTime() {
      this.updateDuration();
    },
    endTime() {
      this.updateDuration();
    }
  }
}
</script>

<style lang="sass">

</style>