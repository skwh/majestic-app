const HOST = PRODUCTION ? '/' : 'http://localhost:8000/';

export default {
  REALTIME_ENDPOINT : HOST + 'api/sensor/all',
  UPDATE_ENDPOINT : HOST + 'api/sensor/update',
  RECENT_ENDPOINT: HOST + 'api/sensor/recent'
}