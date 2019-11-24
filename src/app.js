require('dotenv').config({ path: __dirname + '/config/.web.env'});
const express = require('express');

const db = require('./db');
const utils = require('./utils');
const colors = require('./color');

const cors = require('cors');
const moment = require('moment');

const app = express();

let VIEW_PATH = '/view';

const Logger = (req, res, next) => {
  console.log(`${req.ip} -> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
  next();
}

if (process.env.NODE_ENV === 'development') {
  VIEW_PATH = '../dist' + VIEW_PATH;
}

app.use(Logger);
app.use(express.static(__dirname + VIEW_PATH));

const EXPECTED_UPDATE_FIELDS = ['sensorID', 'Time', 'Lat', 'Long', 'Uncertainty', 'F1', 'Temp', 'Hmdty', 'F3', 'F4', 'PM1_0', 'PM2_5', 'PM10', 'PM1_02', 'PM2_52', 'PM102', 'sig'];
const EXPECTED_QUERY_FIELDS = ['sensorIds', 'startTime', 'endTime', 'fields'];

const MALFORMED_PARAMETER = (res) => res.status(400).json({
  error: 400,
  reason: 'Malformed Parameter'
});

function validate_parameters(res, validation_regexes, parameters) {
  return utils.zip(validation_regexes, parameters).reduce((prev, pair) => {
    let [regex, param] = pair;
    if (!regex.test(param)) prev |= false;
    return prev;
  }, true);
}

function validate_message(expected_fields, message) {
  return expected_fields.map(i => utils.object_has_key(message, i)).reduce((p, c) => p && c);
}

function validate_update_message(body) {
  return validate_message(EXPECTED_UPDATE_FIELDS, body);
}

function validate_query_message(body) {
  return validate_message(EXPECTED_QUERY_FIELDS, body);
}

function validate_times(startTime, endTime) {
  return moment(startTime).isBefore(endTime);
}

function convert_to_csv(values) {
  let val = "";
  val += Object.keys(values[0]).join() + "\n";
  val += values.reduce((acc, v) => acc += utils.values_as_array(v, Object.keys(v)).join() + "\n", "");
  return val;
}

/**
 * PUT : API/SENSOR/UPDATE
 * Endpoint for updaing the sensor measurements
 * Request format: json
 * {
 *  sensorId: string,
 *  Time: number,
 *  PM2_5: number
 * }
 * Response: if success: 200 OK
 *              bad param: 400 Malformed Parameter
 *              otherwise: 500 Server Error
 */
app.put('/api/sensor/update', cors(), express.json(), (req, res, next) => { 
  let canary_message = req.body;
  if (!validate_update_message(canary_message)) {
    MALFORMED_PARAMETER(res);
    return;
  }
  let sensor_id = req.body['sensorID'];
  const query = `INSERT INTO canary_sensor_data(
                  input_timestamp, 
                  sensor_id, 
                  canary_message) 
                VALUES(current_timestamp, $1, $2)`;
  db.query(query, [sensor_id, canary_message], (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  })
});

/**
 * GET : API/SENSOR/RECENT
 * Returns the latest measurement from all sensors
 * Response format: json
 * size: number,
 * data: [
 *  {
 *    sensorId: string,
 *    Time: number,
 *    PM2_5: number
 *  }, ...
 * ]
 */
app.get('/api/sensor/recent', cors(), (req, res, next) => {
  db.query(`SELECT * FROM canary_recent_data`, (error, result) => {
    if (error) {
      next(error);
    } else {
      res.json({ 
        size: result.rows.length,
        data: result.rows 
      });
    }
  });
});

/**
 * GET : API/SENSOR
 * Returns data based on the passed parameters.
 * Request headers required: Accept
 * Request format: json
 * Request parameters: (all are required)
 *  - startTime (time: ISO 8601 or unix timestamp)
 *  - endTime (time)
 *  - sensorIds (list of sensor ids)
 *  - fields (list of fields to be included)
 * Response format: json OR csv
 * size : number,
 * data : [
 *  {
 *    Time: number, !! Time is automatically included, even if not specified in fields
 *    sensorId: string,
 *    (... other requested fields)
 *  }
 * ]
 */
app.get('/api/sensor', cors(), express.json(), (req, res, next) => {
  let request = req.body;
  if (!validate_query_message(request) || !validate_times(request.startTime, request.endTime)) {
    MALFORMED_PARAMETER(res);
    return;
  }
  if (!utils.contains(request.fields, 'Time')) {
    request.fields.push('Time');
  }
  request.fields.push('sensorID');
  db.query(`SELECT canary_message FROM canary_sensor_data WHERE input_timestamp BETWEEN $1 AND $2 AND sensor_id = ANY ($3)`, 
                                            [request.startTime, request.endTime, request.sensorIds], 
                                            (error, result) => {
    if (error) {
      next(error);
    } else {
      let rows = result.rows.map(v => utils.filter_keys(v['canary_message'], request.fields));
      res.format({
        'text/csv': () => res.send(convert_to_csv(rows)),
        default: () => res.json({
          size: rows.length,
          data: rows
         }),
      });
    }
  })
});

/**
 * Returns the avaliable fields to query. 
 * Results can be used in a basic SENSOR query.
 */
app.get('/api/sensor/fields', cors(), (req, res, next) => {
  res.json({ fields : EXPECTED_UPDATE_FIELDS });
})

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 Internal Server Error');
});

app.listen(process.env.SERVE_PORT || 4000, () => console.log('Server online.'));