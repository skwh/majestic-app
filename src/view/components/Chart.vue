<script>
import { Line, mixins } from 'vue-chartjs';
// import axios from 'axios';
const { reactiveData } = mixins

const OPTIONS = {
  responsive: false,
  scales: {
    xAxes: [{
      display: true,
      scaleLabel: {
        display: true,
        labelString: 'Time'
      }
    }],
    yAxes: [{
      display: true,
      scaleLabel: {
        display: true,
        labelString: 'ug/m^3'
      }
    }]
  }
}

const SENSOR_ALL_PATH = '/api/sensor/all';

const getAllSensorData = function() {
  return [
    {
      'sensorId': 'CM1',
      'PM2_5': 6.9,
      'Time': '6:02:03'
    },
    {
      'sensorId': 'CM1',
      'PM2_5': 6.7,
      'Time': '6:04:03'
    },
    {
      'sensorId': 'CM1',
      'PM2_5': 8.72,
      'Time': '6:07:03'
    },
  ];
  // axios.get(SENSOR_ALL_PATH).then(response => {
  //   console.log(response);
  //   dataRef = response.data.data;
  // })
};

const extractDataValues = function( messages, value ) {
  return messages.map((obj) => obj[value]);
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
      latest: [],
      lastUpdated: -1
    }
  },
  methods: {
    makeChartDataObject ( latestData ) {
      this.chartdata = {
        labels: extractDataValues( latestData, 'Time' ),
        datasets: [{
          label: this.sensor,
          backgroundColor: 'rgb(0, 0, 0, 0)',
          borderColor: 'rgb(99, 99, 132)',
          data: extractDataValues( latestData, this.sensor )
        }],
      }
    },
    fetchChartData () {
      this.latest = getAllSensorData();
    }
  },
  mounted() {
    this.fetchChartData();
    this.makeChartDataObject( this.latest );
    this.renderChart(this.chartdata, OPTIONS)
  }
}
</script>

<style lang="sass">

</style>