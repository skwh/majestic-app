/**
 * Encapsulating the app code in a function allows for 
 * dependency injection, making testing easier.
 */
function CreateApp(express, cors, moment, helmet, db, utils) {
  const app = express();

  let VIEW_PATH = '/view';

  const Logger = (req, res, next) => {
    console.log(`${req.ip} -> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
    res.on('finish', () => {
      console.log(`${req.ip} <- ${res.statusCode} ${res.statusMessage}`);
    })
    next();
  }
  
  if (process.env.NODE_ENV === 'development') {
    VIEW_PATH = '../dist' + VIEW_PATH;
    console.log(VIEW_PATH);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.use(helmet());
    app.use(Logger);
  }
  app.use(express.static(__dirname + VIEW_PATH));

  /**
   * A message to API/SENSOR/UPDATE must have the fields in the first column of this array,
   * with the second column corresponding to their units. Replaces separate arrays for each.
   */
  const EXPECTED_CANARY_MESSAGE_FORMAT = [
    ['source_device', 'Identification Number'],
    ['datetime', 'Datetime'],
    ['Time', 'time'],
    ['Lat', 'coordinate'],
    ['Long', 'coordinate'],
    ['Uncertainty', 'none'],
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

  const MALFORMED_PARAMETER = (res) => res.status(400).json({
    error: 400,
    reason: 'Malformed Parameter'
  });

  function validate_message(expected_fields, message) {
    return utils.object_has_keys(message, expected_fields);
  }

  function validate_update_message(body) {
    let [ update_message_required_keys, _ ] = utils.unzip(EXPECTED_CANARY_MESSAGE_FORMAT);
    return validate_message(update_message_required_keys, body);
  }

  function validate_query_message(body) {
    if (validate_message(['startTime', 'endTime'], body)) {
      return validate_times(body['startTime'], body['endTime']);
    }
    // Because the query message is later filled with default values,
    // there are no missing fields and it is automatically valid
    return true;
  }

  function validate_times(startTime, endTime) {
    return utils.before(startTime, endTime);
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

  const DEFAULT_QUERY_REQUEST_PARAMETERS = [
    ['startTime', 0],
    ['endTime', 0],
    ['download', false],
    ['format', 'json'],
    ['sensorIds', []],
    ['fields', [CANARY_MESSAGE_SENSOR_ID_FIELD_NAME, 'Time']]
  ];

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
    if (utils.parse_boolean(request.download)) {
      res.setHeader('Content-Disposition', `attachment; filename="${build_filename(request.startTime, request.endTime, request.format)}"`);
    }
    let { QUERY, PARAMS } = handle_sensor_query(request, SENSOR_QUERY_ALL_SENSORS, SENSOR_QUERY_SOME_SENSORS);
    db.query(QUERY, PARAMS, (error, result) => {
      if (error) {
        next(error);
      } else {
        result.rows.map(v => utils.filter_keys(v.canary_message, request.fields));
        if (request.format === 'csv') {
          res.send(utils.convert_to_csv(result.rows.map(v => v.canary_message)));
        } else {
          res.json({ size: result.rows.length, data: result.rows });
        }
      }
    })
  });

  function handle_sensor_query(queryParams, ALL_SENSORS_QUERY, SOME_SENSORS_QUERY) {
    let request = utils.fill_default_values(queryParams, DEFAULT_QUERY_REQUEST_PARAMETERS);
    const all_sensors = utils.contains(request.sensorIds, '*') || request.sensorIds.length === 0;
    const params = [moment(request.startTime).format(), moment(request.endTime).format()];
    return {
      QUERY: all_sensors ? ALL_SENSORS_QUERY : SOME_SENSORS_QUERY,
      PARAMS: all_sensors ? params : (params.concat([request.sensorIds])) // sensorIds must be concat onto the end because it is the third argument, $3 
    }
  }

  const SENSOR_COUNT_QUERY_ALL_SENSORS = `SELECT COUNT(sensor_id) FROM canary_sensor_data WHERE input_timestamp BETWEEN $1 AND $2`;
  const SENSOR_COUNT_QUERY_SOME_SENSORS = `SELECT COUNT(sensor_id) FROM canary_sensor_data WHERE input_timestamp BETWEEN $1 AND $2 AND sensor_id = ANY ($3)`;

  /**
   * GET : API/SENSOR/COUNT
   * Returns the size of a query to API/SENSOR.
   * Takes the same parameters, but always returns JSON count of the rows returned.
   */
  app.get('/api/sensor/count', cors(), express.json(), (req, res, next) => {
    let request = req.query;
    let { QUERY, PARAMS } = handle_sensor_query(request, SENSOR_COUNT_QUERY_ALL_SENSORS, SENSOR_COUNT_QUERY_SOME_SENSORS);
    db.query(QUERY, PARAMS, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.json({ size: result.rows[0]['count'] });
      }
    });
  })

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
    if (utils.parse_boolean(req.query.units)) {
      res.json({ data: EXPECTED_CANARY_MESSAGE_FORMAT });
    } else {
      let [ fields, _ ] = utils.unzip(EXPECTED_CANARY_MESSAGE_FORMAT);
      res.json({ data : fields });
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


module.exports = CreateApp;