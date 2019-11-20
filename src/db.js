const { Pool } = require('pg');
const utils = require('./utils');

const pool = new Pool();

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, (err, res) => {
      callback(err, res);
    });
  },
  getClient: (callback) => {
    pool.connect((err, client, done) => {
      callback(err, client, done);
    });
  },
};