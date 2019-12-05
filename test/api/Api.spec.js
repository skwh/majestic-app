const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Injected Dependencies
const express = require('express');
const moment = require('moment');
const helmet = require('helmet');
const cors = require('cors');

// Mocked Database
const db = function(error, result) {
  return { 
    query: (_, _, callback) => callback(error, result) 
  };
}
const utils = require('../../src/utils');

const appBuilder = (dbError, dbResult) => require('../../src/app')(express, cors, moment, helment, db(dbError, dbResult), utils);

describe('majestic-app API', () => {
  describe('GET /api/sensor/recent', () => {
    it('should return empty if the database is empty');
    it('should only return one row for each sensor');
    it('should return the most recent data for each sensor');
  });

  describe('PUT /api/sensor/update', () => {
    it('should reject an update without all the correct parameters');
    it('should accept an update with the correct parameters');
  });

  describe('GET /api/sensor', () => {
    it('should reject a query without all the query parameters');
    it('should reject a query with mixed up dates');
    it('should accept multiple sensor values');
    it('should accept multiple field values');
  });

  describe('GET /api/sensor/count', () => {
    it('should return empty for a query without all the query parameters');
    it('should correctly match the number of rows based on the given parameters');
  })

  describe('GET /api/sensor/fields', () => {
    it('should return a list of fields');
    it('should also return a list of units if requested');
  });

  describe('GET /api/sensor/sensors', () => {
    it('should return a list of sensor_ids and their colors');
    it('should return empty if the database is empty');
  })
})
