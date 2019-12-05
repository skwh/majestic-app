const HOST = PRODUCTION ? '/' : 'http://localhost:8000/';

export default {
  REALTIME_ENDPOINT : HOST + 'api/sensor/recent',
  DATA_ENDPOINT : HOST + 'api/sensor',
  DATA_COUNT_ENDPOINT : HOST + 'api/sensor/count',
  ALL_SENSORS_ENDPOINT : HOST + 'api/sensor/sensors',
  ALL_FIELDS_ENDPOINT : HOST + 'api/sensor/fields',
  RECENT_REALTIME_QUERY : (startTime, endTime, field, sensors) => `?download=false&format=json&startTime=${startTime}&endTime=${endTime}&fields[]=${field}&${ sensors.map(s => `sensorIds[]=${s}`).join('&') }`, 
  DOWNLOAD_QUERY : (startTime, endTime, fields, sensors, format) => `?download=true&format=${format}&startTime=${startTime}&endTime=${endTime}${ fields.map(f => `&fields[]=${f}`).join('') }${ sensors.map(s => `&sensorIds[]=${s}`).join('') }`, 
}