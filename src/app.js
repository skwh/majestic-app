require('dotenv').config({ path: __dirname + '/config/.web.env'});
const express = require('express');

const db = require('./db');
const utils = require('./utils');

const cors = require('cors');
const moment = require('moment');
const helmet = require('helmet');

/**
 * Encapsulating the app code in a function allows for 
 * dependency injection, making testing easier.
 */
function CreateApp(express, cors, moment, helmet, db, utils) {
  const app = express();

  let VIEW_PATH = '/view';

  const Logger = (req, res, next) => {
    console.log(`${req.ip} -> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
    next();
  }

  if (process.env.NODE_ENV === 'development') {
    VIEW_PATH = '../dist' + VIEW_PATH;
    console.log(VIEW_PATH);
  }
  app.use(helmet());
  app.use(Logger);
  app.use(express.static(__dirname + VIEW_PATH));

  const EXPECTED_UPDATE_FIELD_UNITS = ['none', 'timestamp', 'coordinate', 'coordinate', 'none', 'flag', 'degrees farenheit', 'percent', 'flag', 'flag', 'µg/m3', 'µg/m3', 'µg/m3', 'µg/m3', 'µg/m3', 'µg/m3', 'signal'];
  const EXPECTED_UPDATE_FIELDS = ['sensorID', 'Time', 'Lat', 'Long', 'Uncertainty', 'F1', 'Temp', 'Hmdty', 'F3', 'F4', 'PM1_0', 'PM2_5', 'PM10', 'PM1_02', 'PM2_52', 'PM102', 'sig'];
  const EXPECTED_QUERY_FIELDS = ['sensorIds', 'startTime', 'endTime', 'fields', 'download'];

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
    return validate_message(EXPECTED_QUERY_FIELDS, body) 
        && validate_times(body['startTime'], body['endTime']);
  }

  function validate_times(startTime, endTime) {
    return moment(startTime).isBefore(endTime);
  }

  function build_filename(startTime, endTime, format) {
    return `du-sensor-data-${moment(startTime).format('Y-MM-DD')}--${moment(endTime).format('Y-MM-DD')}.${format}`;
  }

  // parsing bool from string is probably the messiest thing i have ever seen
  function parse_boolean(str) {
    switch(str.toLowerCase()) {
      case 'true': case 't': case '1': return true;
      default: return false;
    }
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
   *    sensorID: string,
   *    Time: number,
   *    PM2_5: number
   *  }, ...
   * ]
   */
  app.get('/api/sensor/recent', cors(), (req, res, next) => {
    db.query(`SELECT canary_message, sensor_color FROM canary_recent_data`, (error, result) => {
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

  const SENSOR_QUERY_SOME_SENSORS = `SELECT sensor_id,canary_message FROM canary_sensor_data WHERE input_timestamp BETWEEN $1 AND $2 AND sensor_id = ANY ($3)`;
  const SENSOR_QUERY_ALL_SENSORS = `SELECT sensor_id,canary_message FROM canary_sensor_data WHERE input_timestamp BETWEEN $1 AND $2`;

  /**
   * GET : API/SENSOR
   * Returns data based on the passed parameters.
   * Request headers required: Accept (text/csv, default: application/json)
   * Request format: query params
   * Request parameters: (all are required)
   *  - startTime (time: ISO 8601 or unix timestamp)
   *  - endTime (time)
   *  - download (boolean)
   *  - sensorIds (list of sensor ids, if '*' is supplied, all are included)
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
    let request = req.query;
    if (!validate_query_message(request)) {
      MALFORMED_PARAMETER(res);
      return;
    }
    if (parse_boolean(request.download)) {
      let format = req.accepts('text/csv') ? 'csv' : 'json';
      res.setHeader('Content-Disposition', `attachment; filename="${build_filename(request.startTime, request.endTime, format)}"`);
    }
    if (!utils.contains(request.fields, 'Time')) {
      request.fields.push('Time');
    }
    request.fields.push('sensorID');
    const { QUERY, PARAMS } = (() => {
      const all_sensors = utils.contains(request.sensorIds, '*');
      const params = [request.startTime, request.endTime];
      return {
        QUERY: all_sensors ? SENSOR_QUERY_ALL_SENSORS : SENSOR_QUERY_SOME_SENSORS,
        PARAMS: all_sensors ? params : (params.concat([request.sensorIds])) // here ':' means 'OR' not 'cons'
      }
    })();
    db.query(QUERY, PARAMS, (error, result) => {
      if (error) {
        next(error);
      } else {
        let rows = result.rows.map(v => { v.canary_message = utils.filter_keys(v['canary_message'], request.fields); return v; });
        res.format({
          'text/csv': () => res.send(convert_to_csv(rows)),
          'default': () => res.json({
            size: rows.length,
            data: rows
          }),
        });
      }
    })
  });

  /**
   * GET : API/SENSOR/FIELDS
   * Returns the avaliable fields to query. 
   * Results can be used in a basic SENSOR query.
   * Parameters: units (boolean)
   * If units is truthy, then each field is zipped 
   *   into an array along with its unit as a word.
   * Response type: json
   */
  app.get('/api/sensor/fields', cors(), (req, res, next) => {
    if (parse_boolean(req.query.units)) {
      res.json({ fields: utils.zip(EXPECTED_UPDATE_FIELDS, EXPECTED_UPDATE_FIELD_UNITS) });
    } else {
      res.json({ fields : EXPECTED_UPDATE_FIELDS });
    }
  });

  app.get('/api/sensor/sensors', cors(), (req, res, next) => {
    db.query('SELECT sensor_id, sensor_color FROM canary_recent_data', (error, result) => {
      if (error) {
        next(error);
      } else {
        res.json({ data: result.rows });
      }
    })
  })

  app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('500 Internal Server Error');
  });

  return app.listen(process.env.SERVE_PORT || 8000, () => console.log('Server online.'));
}

CreateApp(express, cors, moment, helmet, db, utils);

module.exports = CreateApp;