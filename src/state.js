const db = require('./db');
const utils = require('./utils');
const colors = require('./color');

const state = {
  sensors: {}
};

function validate_parameters(res, validation_regexes, parameters) {
  let validated = utils.zip(validation_regexes, parameters).reduce((prev, pair) => {
    let [regex, param] = pair;
    if (!regex.test(param)) prev |= false;
    return prev;
  }, true);
  if (!validated) res.status(400).json({ error: 400, reason: 'Malformed Parameter'});
  return validated;
}

function update_state_from_database(old_state) {
  db.query('SELECT * FROM canary_sensor_colors', (error, result) => {
    if (error) {
      console.error(error);
    } else {
      old_state = recreate_state(result);
    }
  });
}

function recreate_state(db_result) {
  return {
    sensors: db_result.rows,
    colors: colors.colors 
  };
}

function add_new_sensor(sensorID, remaining_colors) {
  const query = 'INSERT INTO canary_sensor_colors(sensor_id, sensor_color) VALUES($1, $2);';
  db.query(query, [sensorID, colors.random(remaining_colors)], (error, result) => {
    if (error) {
      console.error(error);
    }
  })
}

module.exports = {
  state: state,
  update: update_state_from_database,
  sensor: {
    recent: (req, res, next) => {
      let sensor_ids = Object.keys(state.sensors);
      db.query(`SELECT * FROM canary_sensor_data WHERE 'sensor_id' IN $1`, (error, result) => {
        if (error) {
          next(error);
        } else {
          res.json({ data: result.rows });
        }
      });
    },
    all: (req, res, next) => {
      
    },
    id: (req, res, next) => {
      const id = req.params['id'];
      if (!validate_parameters(res, [/\w/], [id])) {
        return;
      } else {
        db.query(`SELECT * FROM canary_sensor_data WHERE sensor_id=$1`, [id], (error, result) => {
          if (error) {
            next(error);
          } else {
            res.json({ data: result.rows });
          }
        });
      }
    },
    update: (req, res, next) => {
      let canary_message = req.body;
      let sensor_id = req.body['sensorID'];
      if (state.sensors[sensor_id] === undefined) {
        add_new_sensor(sensor_id, colors.colors);
        update_state_from_database(state);
      }
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
    }
  }
}