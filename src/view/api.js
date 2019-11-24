const HOST = PRODUCTION ? '/' : 'http://localhost:8000/';

export default {
  REALTIME_ENDPOINT : HOST + 'api/sensor/recent',
  UPDATE_ENDPOINT : HOST + 'api/sensor/update',
}