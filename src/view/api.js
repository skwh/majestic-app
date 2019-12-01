const HOST = PRODUCTION ? '/' : 'http://localhost:8000/';

export default {
  REALTIME_ENDPOINT : HOST + 'api/sensor/recent',
  DATA_ENDPOINT : HOST + 'api/sensor',
  ALL_SENSORS_ENDPOINT : HOST + 'api/sensor/sensors',
  RECENT_REALTIME_QUERY : (startTime, endTime, field, sensors) => `?download=false&startTime=${startTime}&endTime=${endTime}&fields[]=${field}&${ sensors.map(s => `sensorIds[]=${s}`).join('&') }`, 
}