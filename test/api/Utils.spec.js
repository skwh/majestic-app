const chai = require('chai');
const assert = chai.assert;
const utils = require('../../src/utils');

describe('Utility functions', () => {

  describe('zip', () => {
    let ary1, ary2;

    beforeEach(() => {
      ary1 = [1,2,3];
      ary2 = ['a', 'b', 'c'];
    });

    it('should correctly zip two arrays', () => {
      let expected_result = [[1, 'a'], [2, 'b'], [3, 'c']];

      let actual_result = utils.zip(ary1, ary2);
      assert.deepEqual(expected_result, actual_result);
    });
  });

  describe('unzip', () => {
    it('should return an array consisting of two arrays constructed from the first and second items, respectively, of the given subarrays', () => {
      let zipped_array = [
        [1, 'a'], 
        [2, 'b'], 
        [3, 'c']
      ];
      let expected_result = [
        [1, 2, 3], 
        ['a', 'b', 'c']
      ];

      let actual_result = utils.unzip(zipped_array);
      assert.deepEqual(expected_result, actual_result);
    });

    it('should skip a subarray that is not of size 2', () => {
      let badly_zipped_array = [
        [1, 'a'],
        [2],
        [3, 'c']
      ];
      let expected_result = [
        [1, 3],
        ['a', 'c']
      ];

      let actual_result = utils.unzip(badly_zipped_array);
      assert.deepEqual(expected_result, actual_result);
    });
  });

  describe('object_has_key', () => {
    it('should return true if an object does have a given key', () => {
      let object = {
        'a' : 1
      };

      let actual_result = utils.object_has_key(object, 'a');
      assert.isTrue(actual_result);
    });

    it('should return false if an object does not have the given key', () => {
      let object = {
        'a' : 1
      };

      let actual_result = utils.object_has_key(object, 'b');
      assert.isFalse(actual_result);
    });

    it('should return true even if the value of the key is "undefined"', () => {
      let object = {
        'a' : undefined
      };

      let actual_result = utils.object_has_key(object, 'a');
      assert.isTrue(actual_result);

      let alternative_result = utils.object_has_key(object, 'b');
      assert.isFalse(alternative_result);
    });
  });

  describe('object_has_keys', () => {
    it('should return true if the given object has all of the given keys', () => {
      let object = {
        'a': 1,
        'b': true,
        'c': "true",
        'd': () => true,
        'e': undefined,
        'f': null
      };

      let actual_result = utils.object_has_keys(object, ['a', 'b', 'c', 'd', 'e']);

      assert.isTrue(actual_result);
    });
    
    it('should return false if the given object is missing one of the given keys', () => {
      let object = {
        'a': 1,
        'c': "true"
      };

      let actual_result = utils.object_has_keys(object, ['a', 'b', 'c']);

      assert.isFalse(actual_result);
    });
  })

  describe('iterate_on_keys', () => {
    it('should perform a map on the keys of an object', () => {
      const keyToUpperCase = (obj, key) => {
        obj[key.toUpperCase()] = obj[key];
        delete obj[key];
      };
      let object = {
        'a' : 1,
        'b' : 2
      };

      let expected_result = {
        'A' : 1,
        'B' : 2
      };
      let actual_result = utils.iterate_on_keys(object, keyToUpperCase);

      assert.deepEqual(expected_result, actual_result);
    });
  });

  describe('filter_keys', () => {
    it('should return an object which only has the given keys', () => {
      let object = {
        'a': 1,
        'b': 2,
        'c': 3
      };

      let expected_result = {
        'a': 1,
        'c': 3
      };
      let actual_result = utils.filter_keys(object, ['a', 'c']);
      
      assert.deepEqual(expected_result, actual_result);
    });
  });

  describe('contains', () => {
    it('should return true if an array contains a value', () => {
      let array = [1, 2, 3, 4];

      assert.isTrue(utils.contains(array, 1));
      assert.isFalse(utils.contains(array, 7));
    });
  });

  describe('values_as_array', () => {
    it('should return an array consisting of the values of the keys of the object', () => {
      let object = {
        'a': 1,
        'b': 2,
        'c': 3
      };

      let expected_result = [1,2,3];
      let actual_result = utils.values_as_array(object, ['a', 'b', 'c']);

      assert.deepEqual(expected_result, actual_result);
    });
  });

  describe('parse_boolean', () => {
    it('should correclty parse "true"', () => assert.isTrue(utils.parse_boolean('true')) );
    it('should correctly parse "t"', () => assert.isTrue(utils.parse_boolean('t')) );
    it('should correctly parse "1"', () => assert.isTrue(utils.parse_boolean('1')) );
    it('should default all other values to false', () => assert.isFalse(utils.parse_boolean('false')) );
  });

  describe('build_filename', () => {
    it('should build a correct filename', () => {
      let startDate = 100000000;
      let endDate = 100000001;
      let format = 'csv';

      let expected_result = `du-sensor-data-1970-01-01--1970-01-01.csv`;
      let actual_result = utils.build_filename(startDate, endDate, format);

      assert.equal(expected_result, actual_result);
    });
  });

  describe('before', () => {
    it('should return true if moment(a) is Before moment(b)', () => {
      assert.isTrue(utils.before(0, 1));
    });
  });

  describe('convert_to_csv', () => {
    it('should return a string representing csv for the given values', () => {
      let values = [
        { 'a' : 1, 'b' : 2 },
        { 'a' : 3, 'b' : 4 }
      ];
      let expected_result = `a,b\n1,2\n3,4\n`;
      let actual_result = utils.convert_to_csv(values);
      
      assert.equal(expected_result, actual_result);
    });

    it('should return an empty indication if the given values are empty', () => {
      let values = [];

      let expected_result = "Zero rows returned";
      let actual_result = utils.convert_to_csv(values);

      assert.equal(expected_result, actual_result);
    });
  });

  describe('fill_default_values', () => {
    it('should not interfere with given values', () => {
      let object = {
        'a' : 1,
        'b' : 2
      };
      let default_values = [
        ['a', 5],
        ['c', 3]
      ];

      let expected_result = {
        'a' : 1,
        'b' : 2,
        'c' : 3
      };

      let actual_result = utils.fill_default_values(object, default_values);
      assert.equal(expected_result['a'], actual_result['a']);
    });

    it('should replace undefined fields with defaults', () => {
      let object = {
        'a' : 1
      };
      assert.isUndefined(object['b']);
      utils.fill_default_values(object, [['a', 1], ['b', 2]]);
      assert.isDefined(object['b']);
    });
  });

});