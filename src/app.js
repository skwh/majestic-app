require('dotenv').config({ path: __dirname + '/config/.web.env'});

const db = require('./db');
const utils = require('./utils');

const express = require('express');
const cors = require('cors');
const moment = require('moment');
const helmet = require('helmet');
const https = require('https');
const http = require('http');

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

  /**
   * A message to API/SENSOR/UPDATE must have the fields in the first column of this array,
   * with the second column corresponding to their units. Replaces separate arrays for each.
   */
  const EXPECTED_CANARY_MESSAGE_FORMAT = [
    ['source_device', 'Identification Number'],
    ['datetime', 'Datetime'],
    ['time', 'time'],
    ['Lat', 'coordinate'],
    ['Long', 'coordinate'],
    ['Uncertianity', 'none'],
    ['F1', 'flag'],
    ['F3', 'flag'],
    ['F4', 'flag'],
    ['Sig', 'significance'],
    ['Hmdty', 'percent'],
    ['Temp', 'degrees farenheit'],
    ['PM1_0', 'µg/m3'],
    ['PM2_5', 'µg/m3'],
    ['PM10', 'µg/m3'],
    ['PM1_02', 'µg/m3'],
    ['PM2_52', 'µg/m3'],
    ['PM102', 'µg/m3']
  ];

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
    let { array1 } = utils.unzip(EXPECTED_CANARY_MESSAGE_FORMAT);
    return validate_message(array1, body);
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
    if (str === undefined) return false;
    switch(str.toLowerCase()) {
      case 'true': case 't': case '1': return true;
      default: return false;
    }
  }

  function convert_to_csv(values) {
    let val = "";
    if (values.length < 1)
      return "Zero rows returned";
    val += Object.keys(values[0]).join() + "\n";
    val += values.reduce((acc, v) => acc += utils.values_as_array(v, Object.keys(v)).join() + "\n", "");
    return val;
  }

  const CANARY_MESSAGE_SENSOR_ID_FIELD_NAME = 'source_device';

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
    let sensor_id = req.body[CANARY_MESSAGE_SENSOR_ID_FIELD_NAME];
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
   * Request format: query params
   * Request parameters: (all are required)
   *  - startTime (time: ISO 8601 or unix timestamp)
   *  - endTime (time)
   *  - download (boolean)
   *  - format ('json' or 'csv', default 'json')
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
    request.fields.push(CANARY_MESSAGE_SENSOR_ID_FIELD_NAME);
    const { QUERY, PARAMS } = (() => {
      const all_sensors = utils.contains(request.sensorIds, '*');
      const params = [moment(request.startTime).format(), moment(request.endTime).format()];
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
        if (request.format === 'csv')
          res.send(convert_to_csv(rows.map(v => v['canary_message'])));
        else
          res.json({ size: rows.length, data: rows });
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
      res.json({ data: EXPECTED_CANARY_MESSAGE_FORMAT });
    } else {
      let {
        array1
      } = utils.unzip(EXPECTED_CANARY_MESSAGE_FORMAT);
      res.json({ data : array1 });
    }
  });

  /**
   * GET : API/SENSOR/SENSORS
   * Returns the sensors currently registered in the database.
   * Parameters: none
   * Response type: json
   */
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

  return app;
}

const app = CreateApp(express, cors, moment, helmet, db, utils);

const httpServer = http.createServer(app);
httpServer.listen(process.env.SERVE_PORT || 8000, () => console.log('Server online.'));

if (process.env.SERVE_HTTPS) {
  const privateKey = 'false'; // Replace with fs readFileSync and cert location
  const certificate = 'false';
  
  const HTTPS_CREDENTIALS = {
    key: 'false',
    cert: 'false'
  };

  const httpsServer = https.createServer(HTTPS_CREDENTIALS, app);
  
  httpsServer.listen(process.env.HTTPS_SERVE_PORT || 8443, () => console.log('HTTPS Server online.'));
}

module.exports = CreateApp;