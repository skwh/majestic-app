// Store state data here

const db = require('./db');
const utils = require('./utils');
const colors = require('./color');

function validate_parameters(res, validation_regexes, parameters) {
  let validated = utils.zip(validation_regexes, parameters).reduce((prev, pair) => {
    let [regex, param] = pair;
    if (!regex.test(param)) prev |= false;
    return prev;
  }, true);
  if (!validated) res.status(400).json({ error: 400, reason: 'Malformed Parameter'});
  return validated;
}

module.exports = {
  sensor: {
    recent: (req, res, next) => {
      db.query(`SELECT * FROM canary_sensor_data LIMIT 5`, (error, result) => {
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

    }
  }
}