const chai = require('chai');
const assert = chai.assert;
const utils = require('../../src/utils');

describe('Utility functions', () => {
  describe('zip', () => {
    it('should correctly zip two arrays');
  });

  describe('unzip', () => {
    it('should return an array consisting of two arrays constructed from the first and second items, respectively, of the given subarrays');
    it('should skip a subarray that is not of size 2');
  });

  describe('object_has_key', () => {
    it('should return true if an object had that key assigned at some point');
  });

  describe('object_has_keys', () => {
    it('should return true if the given object has all of the given keys')
  })

  describe('iterate_on_keys', () => {
    it('should perform a map on the keys of an object');
  });

  describe('filter_keys', () => {
    it('should return an object which only has the given keys');
  });

  describe('contains', () => {
    it('should return true if an array contains a value');
  });

  describe('values_as_array', () => {
    it('should return an array consisting of the values of the keys of the object');
  });

  describe('parse_boolean', () => {
    it('should correclty parse "true"');
    it('should correctly parse "t"');
    it('should correctly parse "1"');
    it('should default all other values to false');
  });

  describe('build_filename', () => {
    it('should build a correct filename');
  });

  describe('before', () => {
    it('should return true if moment(a) is Before moment(b)');
  });

  describe('convert_to_csv', () => {
    it('should return a string representing csv for the given values');
    it('should return an empty indication if the given values are empty');
  });

  describe('fill_default_values', () => {
    it('should not interfere with given values');
    it('should replace undefined fields with defaults');
  });

});