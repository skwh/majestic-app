// Store state data here

const db = require('./db');

const errFunc = (err, next, func, ...args) => {
  if (err) {
    next(err);
  } else {
    func(args);
  }
}

module.exports = {
  sensor: {
    recent: (req, res, next) => {
      db.query(`SELECT * FROM canary_sensor_data LIMIT 5`, (err, result) => errFunc(err, next, (result, res) => {
        res.json({ data: result.rows });
      }, result, res));
    },
    all: (req, res, next) => {

    },
    id: (req, res, next) => {
      const id = req.params['id'];
      db.query(`SELECT * FROM canary_sensor_data WHERE sensor_id IS ${id}`, (e, r) => errFunc(e, next, (result, res) => {
        res.json({ data: result.rows });
      }, r, res));
    }
  }
}