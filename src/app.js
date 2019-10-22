require('dotenv').config({ path: __dirname + '/.web.env'})
const express = require('express');
const db = require('./db');
const cors = require('cors');
const app = express();

const logger = (req, res, next) => {
  console.log(`-> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
  next();
}

if (!PRODUCTION) {
  app.use(logger);
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
  let mock_data = [1,2,3].map((i) => {
    return {
      sensorId: `CM${i}`,
      Time: Date.now(),
      PM2_5: Math.pow(Math.random(i) * 10, Math.random(i) * 2)
    }
  });
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

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 Internal Server Error');
});

app.listen(process.env.SERVE_PORT, () => console.log("server online."));