const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../../src/app')();

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
  it('should accept multiple sensor values');
  it('should accept multiple field values');
  it('should reject a query with mixed up dates');
});

describe('GET /api/sensor/fields', () => {
  it('should return a list of fields');
  it('should also return a list of units if requested');
});
