<template>
  <section>
    <fieldset class="times">
      <legend>Times</legend>
      <div class="check-list">
        <label for="startTime">Start Date & Time</label>
        <input type="datetime-local" id="startTime" v-model="startTime">
        <label for="endTime">End Date & Time</label>
        <input type="datetime-local" id="endTime" v-model="endTime">
      </div>
    </fieldset>
    <fieldset class="sensors">
      <legend>Sensors</legend>
      <div class="check-list">
        <template v-for="(name, i) in this.sensors">
          <label :for="makeFor('sensor', name, 'checkbox')" 
                 :key="makeKey('sensor-label', i)">{{ name }}</label>
          <input type="checkbox" 
                 v-model="selectedSensors" 
                :key="makeKey('sensor-input', i)" 
                :value="name" 
                :id="makeFor('sensor', name, 'checkbox')">
        </template>
      </div>
    </fieldset>
    <fieldset class="instruments">
      <legend>Instruments</legend>
      <div class="check-list">
        <template v-for="(name, i) in this.instruments">
          <label :for="makeFor('instrument', name, 'checkbox')" 
                 :key="makeKey('instrument-label', i)">{{ name }}</label>
          <input type="checkbox" 
                 v-model="selectedInstruments" 
                :key="makeKey('instrument-input', i)" 
                :value="name" 
                :id="makeFor('instrument', name, 'checkbox')">
        </template>
      </div>
    </fieldset>
    <fieldset class="format">
      <legend>Format</legend>
      <div class="check-list">
        <label for="csv">CSV (Comma Separated Values)</label>
        <input type="radio" id="csv" value="csv" v-model="format">
        <label for="json">JSON</label>
        <input type="radio" id="json" value="json" v-model="format">
      </div>
    </fieldset>
    <div class="form-footer-buttons">
      <span>Query has {{ totalRows }} rows.</span>
      <button @click="download"
              :disabled="totalRows < 1">Download</button>
    </div>
  </section>
</template>

<script>
import Axios from 'axios';
import ApiRoutes from '../api';
import moment from 'moment';


export default {
  name: 'Download',
  data() {
    return {
      sensors: [],
      instruments: [],
      startTime: moment().subtract(1, 'hours').format('Y-MM-DDThh:mm'),
      endTime: moment().format('Y-MM-DDThh:mm'),
      format: 'csv',
      selectedSensors: [],
      selectedInstruments: ['Time', 'source_device'],
      totalRows: 0,
    }
  },
  methods: {
    getSensorNames() {
      Axios.get(ApiRoutes.ALL_SENSORS_ENDPOINT).then(res => {
        this.sensors = res.data.data.map(v => v['sensor_id']);
      });
    },
    getInstrumentNames() {
      Axios.get(ApiRoutes.ALL_FIELDS_ENDPOINT).then(res => {
        this.instruments = res.data.data;
      });
    },
    download() {
      window.open(ApiRoutes.DATA_ENDPOINT + ApiRoutes.DOWNLOAD_QUERY(this.startTime,
                                                                     this.endTime,
                                                                     this.selectedInstruments,
                                                                     this.selectedSensors,
                                                                     this.format),
                                                                     'Download');
    },
    makeKey(type, i) {
      return `key-${type}-${i}`;
    },
    makeFor(type, name, element) {
      return `${type}-${name}-${element}`;
    },
    checkIsDefaultIncluded(instrument_name) {
      return DEFAULT_INCLUDED_INSTRUMENTS.indexOf(instrument_name) != -1;
    },
    checkQueryRowCount() {
      Axios.get(ApiRoutes.DATA_COUNT_ENDPOINT + ApiRoutes.DOWNLOAD_QUERY(this.startTime,
                                                                         this.endTime,
                                                                         this.selectedInstruments,
                                                                         this.selectedSensors,
                                                                         this.format))
           .then(res => {
             this.totalRows = res.data.size;
           })
           .catch(err => {
             console.log("couldn't determine size of query result set");
           });
    }
  },
  mounted() {
    this.getSensorNames();
    this.getInstrumentNames();
    this.checkQueryRowCount();
  },
  watch: {
    startTime() {
      this.checkQueryRowCount();
    },
    endTime() {
      this.checkQueryRowCount();
    },
    selectedSensors() {
      this.checkQueryRowCount();
    },
    selectedInstruments() {
      this.checkQueryRowCount();
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  padding: 0vh 10vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 3fr 1fr 1fr;

  fieldset.times {
    grid-row: 1;
    grid-column-start: span 2;
  }

  fieldset.sensors {
    grid-row: 2;
    grid-column: 1;
  }

  fieldset.instruments {
    grid-row: 2;
    grid-column: 2;
  }

  fieldset.format {
    grid-row: 3;
    grid-column-start: span 2;
  }

  div.form-footer-buttons {
    grid-column-start: span 2;
  }
}

div.check-list {
 display: grid;
 grid-template-columns: 1fr 1fr; 
 max-height: 25vh;
 overflow: scroll;

 label {
   grid-column: 1;
 }

 input {
   grid-column: 2;
 }
}

div.form-footer-buttons {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;

  button {
    width: 50%;
  }
}
</style>