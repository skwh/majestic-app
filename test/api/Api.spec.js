const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const spies = require('chai-spies');
chai.use(spies);

// Injected Dependencies
const express = require('express');
const moment = require('moment');
const helmet = () => undefined;
const cors = require('cors');

// api dependency from view helps us build queries
const queryArrayBuilder = (array, key) => array.map(i => `&${key}[]=${i}`).join('');
const queryBuilder = (startTime, endTime, fields, sensors, format, download) => {
  return `?startTime=${startTime}&endTime=${endTime}&format=${format}&download=${download}${queryArrayBuilder(fields, 'fields')}${queryArrayBuilder(sensors, 'sensorIds')}`;
}

// Mocked Database
const db = function (error, result) {
  return {
    /**
     * node-postgres db.query takes 2-3 arguments. 
     * To mock this, we have to consider these cases:
     *  If there are 3 arguments:
     *    - arg 1 is the query
     *    - arg 2 are the parameters
     *    - arg 3 is the callback
     *  Else:
     *    - arg 1 is the query
     *    - arg 2 is the callback
     */
    query: function() {
      switch (arguments.length) {
        case 3:
          arguments[2](error, result);
          break;
        default:
          arguments[1](error, result);
          return;
      }
    }
  };
}
// These tests do not consider database errors, so passing in a mocked database error is always irrelevant.
const appBuilder = (result) => require('../../src/app')(express, cors, moment, helmet, db(undefined, result));

const startTime = '1970-01-01T12:00:00Z';
const endTime = '1970-02-01T12:00:00Z';
const updateExpectedFields = [
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

describe('majestic-app API', () => {
  describe('GET /api/sensor/recent', () => {
    it('should return empty if the database is empty', (done) => {
      let app = appBuilder({
        rows: []
      });
      let expected_value = {
        data: [],
        size: 0
      };
      chai.request(app)
        .get('/api/sensor/recent')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.deepEqual(res.body, expected_value);

          done();
        });
    });

    it('should only return one row for each sensor', (done) => {
      let app = appBuilder({
        rows: [{
            'sensor_id': 'sensor-1',
            'canary_message': {
              'test': 1
            }
          },
          {
            'sensor_id': 'sensor-2',
            'canary_message': {
              'test': 2
            }
          }
        ]
      });
      chai.request(app)
        .get('/api/sensor/recent')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body['size'], 2);

          done();
        });
    });
    // Because this is something that is handled through a trigger on the database,
    // it can't really be tested here, so this test is out
    // it('should return the most recent data for each sensor');
  });

  describe('PUT /api/sensor/update', () => {
    let app, spy;
    beforeEach(() => {
      // The UPDATE endpoint does not expect a return value from the database,
      //  so the result field here is left undefined
      app = appBuilder(undefined);
      spy = chai.spy(db.query);
    });

    it('should reject an update without all the correct parameters', (done) => {
      let incorrect_update_body = {
        'source_device': 'sensor-1',
        'missing-other': 'parameters'
      };
      chai.request(app)
        .put('/api/sensor/update')
        .send(incorrect_update_body)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 400);
          assert.equal(res.body.reason, "Malformed Parameter");
          console.log(spy);

          done();
        });
    });

    it('should accept an update with the correct parameters', (done) => {
      // Make sure you are running Node v12 or higher for this line to work.
      let correct_update_body = Object.fromEntries(updateExpectedFields);
      chai.request(app)
        .put('/api/sensor/update')
        .send(correct_update_body)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);

          done();
        });
    });
  });

  describe('GET /api/sensor', () => {
    let app;

    beforeEach(() => {
      app = appBuilder({
        rows: [{
            'sensor_id': 'sensor-1',
            'canary_message': {
              'test': 1,
              'test-2': 3,
              'Time': 'time',
              'source_device': 'sensor-1'
            },
          },
          {
            'sensor_id': 'sensor-2',
            'canary_message': {
              'test': 2,
              'test-2': 4,
              'Time': 'time',
              'source_device': 'sensor-2'
            },
          }
        ]
      });
    });

    it('should always return the Time and source_device fields in an applicable query', (done) => {
      const query = queryBuilder(startTime, endTime, ['test'], ['*'], 'json', false);
      chai.request(app)
          .get('/api/sensor' + query)
          .end((err, res) => {
            assert.isNull(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');

            assert.isDefined(res.body.data[0]['canary_message']['Time']);
            assert.isDefined(res.body.data[0]['canary_message']['source_device']);

            done();
          });
    });

    it('should accept a query without all the query parameters', (done) => {
      const query = queryBuilder(startTime, endTime, ['test'], [], 'json', 'false');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body['size'], 2);

          // The 'Time' and 'source_device' fields should ALWAYS be defined
          assert.isDefined(res.body.data[0]['canary_message']['Time']);
          assert.isDefined(res.body.data[0]['canary_message']['source_device']);

          done();
        });
    });
    it('should reject a query with mixed up dates', (done) => {
      const query = queryBuilder(endTime, startTime, ['test'], ['*'], 'json', 'false');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 400);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body['reason'], "Malformed Parameter");

          done();
        });
    });
    it('should accept multiple sensor values', (done) => {
      const query = queryBuilder(startTime, endTime, ['test'], ['sensor-1', 'sensor-2'], 'json', 'false');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body['size'], 2);
          assert.isUndefined(res.body.data[0]['canary_message']['test-2']);

          assert.isDefined(res.body.data[0]['canary_message']['Time']);
          assert.isDefined(res.body.data[0]['canary_message']['source_device']);

          done();
        });
    });
    it('should accept multiple field values', (done) => {
      const query = queryBuilder(startTime, endTime, ['test', 'test-2'], ['sensor-1'], 'json', 'false');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.isDefined(res.body.data[0]['canary_message']['test-2']);

          assert.isDefined(res.body.data[0]['canary_message']['Time']);
          assert.isDefined(res.body.data[0]['canary_message']['source_device']);

          done();
        });
    });
    it('should correctly create data for download if requested', (done) => {
      const query = queryBuilder(startTime, endTime, ['test'], ['sensor-1'], 'json', 'true');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.include(res.header['content-disposition'], 'attachment');

          assert.isDefined(res.body.data[0]['canary_message']['Time']);
          assert.isDefined(res.body.data[0]['canary_message']['source_device']);

          done();
        });
    });
    it('should respond with csv if requested', (done) => {
      const query = queryBuilder(startTime, endTime, ['test'], ['sensor-1'], 'csv', 'true');
      chai.request(app)
        .get('/api/sensor' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/csv');
          assert.include(res.header['content-disposition'], 'attachment');

          done();
        });
    });
  });

  describe('GET /api/sensor/count', () => {
    it('should correctly match the number of rows based on the given parameters', (done) => {
      const app = appBuilder({
        rows: [{
          'count': 1
        }]
      });
      const query = queryBuilder(startTime, endTime, ['test'], ['sensor-1'], 'json', 'false');
      chai.request(app)
        .get('/api/sensor/count' + query)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body['size'], 1);

          done();
        });
    });
  })

  describe('GET /api/sensor/fields', () => {
    // Fields doesn't hit the database, so no mock data needed
    const app = appBuilder({});

    it('should return a list of fields', (done) => {
      let expected_value = [
        'source_device',
        'datetime',
        'Time',
        'PM10',
        'PM102',
        'PM2_5',
        'PM2_52',
        'PM1_0',
        'PM1_02',
        'Hmdty',
        'Temp',
        'Lat',
        'Long',
        'Sig',
        'Uncertainty',
        'F1',
        'F3',
        'F4'
      ];
      chai.request(app)
        .get('/api/sensor/fields')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.sameMembers(res.body.data, expected_value);

          done();
        });
    });

    it('should also return a list of units if requested', (done) => {
      chai.request(app)
        .get('/api/sensor/fields?units=true')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.sameDeepMembers(res.body.data, updateExpectedFields);

          done();
        });
    });
  });

  describe('GET /api/sensor/sensors', () => {
    it('should return a list of sensor_ids and their colors', (done) => {
      let expected_value = [{
          sensor_id: 'sensor-1',
          color: '#FFFFFF'
        },
        {
          sensor_id: 'sensor-2',
          color: '#000000'
        }
      ];
      let app = appBuilder({
        rows: expected_value
      });

      chai.request(app)
        .get('/api/sensor/sensors')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.deepEqual(res.body.data, expected_value);

          done();
        });
    });
    it('should return empty if the database is empty', (done) => {
      let app = appBuilder({
        rows: []
      });

      chai.request(app)
        .get('/api/sensor/sensors')
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.data.length, 0);

          done();
        })
    });
  })
})