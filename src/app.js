require('dotenv').config({ path: __dirname + '/.web.env'})
const express = require('express');
const db = require('./db');
const cors = require('cors');
const app = express();

const Logger = (req, res, next) => {
  console.log(`${req.ip} -> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
  next();
}

const mockData = (i) => {
  return {
    sensorId: `CM${i}`,
    Time: Date.now(),
    PM2_5: Math.pow(Math.random(i) * 10, Math.random(i) * 2)
  }
}

const range = (s, e) => Array.from('x'.repeat(e - s), (_, i) => s + i);

if (process.env.NODE_ENV === 'development') {
  app.use(Logger);
}

app.use(express.static(__dirname + '/view'));

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
app.put('/api/sensor/update', cors(), (req, res) => {
  console.log("Got a put request to /api/sensor/update !");
  res.status(200).json({ empty: 'empty' });
});

/**
 * GET : API/SENSOR/ALL
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
app.get('/api/sensor/all', cors(), (req, res, next) => {
  // == MOCK DATA ==
  let mock_data = range(3).map((i) => mockData(i));
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

app.get('/api/sensor/:id', cors(), (req, res, next) => {
  console.log("Got a get request to /api/sensor/" + req.params.id);
  next();
});

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 Internal Server Error');
});

app.listen(process.env.SERVE_PORT, () => console.log("server online."));
