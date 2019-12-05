const chai = require('chai');
const assert = chai.assert;
const utils = require('../../src/utils');

describe('Utility functions', () => {
  describe('zip', () => {
    it('should correctly zip two arrays');
  });

  describe('unzip', () => {
    it('should correctly unzip an array with nested subarrays');
    it('should skip a subarray that is not of size 2');
  });

  describe('object_has_key', () => {
    it('should correctly determine if an object has a given key');
  });

  describe('iterate_on_keys', () => {
    it('should perform a map on the keys of an object');
  });

  describe('filter_keys', () => {
    it('should correctly filter keys from an object');
  });

  describe('contains', () => {
    it('should correctly determine if an array contains a value');
  });

  describe('values_as_array', () => {
    it('should correcly create an array using the values of its keys in an object');
  });
});