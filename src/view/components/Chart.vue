<script>
import { Line, mixins } from 'vue-chartjs';
const { reactiveData } = mixins
import Axios from "axios";
import 'chartjs-plugin-streaming';
import ApiRoutes from '../api';
import moment from 'moment';

const CHART_DEFAULT_TIME_SPAN = 3600000;
const CHART_DEFAULT_REFRESH_RATE = 60000;
const CHART_DEFAULT_DELAY = 30000;

const randMax = (max) => Math.floor(Math.random() * max) + 1;
const randomColor = () => `rgb(${randMax(255)}, ${randMax(255)}, ${randMax(255)})`;

export default {
  extends: Line,
  props: {
    liveupdate: Boolean,
    duration: Number,
    refresh: Number,
    delay: Number,
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
              duration: this.duration || CHART_DEFAULT_TIME_SPAN,
              refresh: this.refresh || CHART_DEFAULT_REFRESH_RATE,
              delay: this.delay || CHART_DEFAULT_DELAY,
              onRefresh: this.onRefresh
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'µg/m^3'
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
      
    },
    parseRealtimeResponse( response ) {
      
    },
    parseRecentResponse( response ) {
      
    },
    addDataset ( label ) {
      
    },
    onRefresh ( chart ) {
      
    },
    getRecentData() {
      
    }    
  },
  mounted() {
    this.makeChartDataObject();
    this.renderChart(this.chartData, this.options);
    this.getRecentData();
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