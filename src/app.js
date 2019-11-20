require('dotenv').config({ path: __dirname + '/config/.web.env'});

const express = require('express');
const db = require('./db');
const api = require('./state');
const cors = require('cors');
const app = express();
const moment = require('moment');

let VIEW_PATH = '/view';

const Logger = (req, res, next) => {
  console.log(`${req.ip} -> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
  next();
}

if (process.env.NODE_ENV === 'development') {
  VIEW_PATH = './dist' + VIEW_PATH;
}

app.use(Logger);
app.use(express.static(__dirname + VIEW_PATH));

let state = api.update();
// Pass the state along with each request
app.use((_, res, next) => {
  res.locals.state = state;
  next();
});

/**
 * PUT : API/SENSOR/UPDATE
 * Endpoint for updaing the sensor measurements
 * Request format: json
 * {
 *  sensorId: string,
 *  Time: number,
 *  PM2_5: number
 * }
 * Response: 200 OK if success
 */
app.put('/api/sensor/update', cors(), express.json(), api.sensor.update);

/**
 * GET : API/SENSOR/ALL/LATEST
 * Returns the latest measurement from all sensors
 * Response format: json
 * data: [
 *  {
 *    sensorId: string,
 *    Time: number,
 *    PM2_5: number
 *  }, ...
 * ]
 */
app.get('/api/sensor/all/latest', cors(), (req, res, next) => {
  // == MOCK DATA ==
  let mock_data = range(1,4).map((i) => mockData(i, moment().format('x')));
  res.json({ data: mock_data });
  // db.query('SELECT NOW() as now', (err, result) => {
  //   if (err) {
  //     console.log(err.stack);
  //     next();
  //   } else {
  //     res.json({ now: result.rows[0] })
  //   }
  // });
});

app.get('/api/sensor/recent', cors(), api.sensor.recent);

app.get('/api/sensor/:id', cors(), api.sensor.id);

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 Internal Server Error');
});

app.listen(process.env.SERVE_PORT || 4000, () => console.log("server online."));