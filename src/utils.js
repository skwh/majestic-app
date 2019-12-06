const moment = require('moment');

function zip(ary1, ary2) {
  let pairs = [];
  for (let i = 0; i < ary1.length; i++) {
    pairs.push([ary1[i], ary2[i]]);
  }
  return pairs;
}

function unzip(ary_of_2_n_arys) {
  let ary1 = [], ary2 = [];
  for (let i=0; i < ary_of_2_n_arys.length; i++) {
    if (ary_of_2_n_arys[i].length != 2) continue;
    ary1.push(ary_of_2_n_arys[i][0]);
    ary2.push(ary_of_2_n_arys[i][1]);
  }
  return [ary1, ary2];
}

function object_has_key(obj, key) {
  return contains(Object.keys(obj), key);
}

function object_has_keys(obj, keys) {
  return boolean_fold(keys.map(i => object_has_key(obj, i)));
}

function boolean_fold(boolArray) {
  return boolArray.reduce((p, c) => p && c);
}

function iterate_on_keys(obj, func) {
  Object.keys(obj).forEach(k => func(obj, k));
  return obj;
}

function filter_keys(obj, keep_keys) {
  let val = iterate_on_keys(obj, (o, k) => {
    if (!contains(keep_keys, k)) delete o[k];
  });
  /* Debugging: If keep keys has too many keys, then somehow we are trying to filter with the wrong instrument fields */
  // switch (ordering(Object.keys(val).length, keep_keys.length)) {
  //   case ('LT'):
  //     console.warn('filter_keys: keep_keys had an extra key!');
  //     break;
  //   case ('GT'):
  //     console.error('filter_keys: I did not remove enough keys!')
  //     break;
  //   default:
  //     break;
  // }
  return val;
}

function build_filename(startTime, endTime, format) {
  return `du-sensor-data-${moment(startTime).format('Y-MM-DD')}--${moment(endTime).format('Y-MM-DD')}.${format}`;
}

function before(a, b) {
  return moment(a).isBefore(b);
}

// parsing bool from string is probably the messiest thing i have ever seen
function parse_boolean(str) {
  if (str === undefined) return false;
  switch(str.toLowerCase()) {
    case 'true': case 't': case '1': return true;
    default: return false;
  }
}

function contains(ary, val) {
  return ary.indexOf(val) != -1;
}

function values_as_array(obj, keys) {
  return keys.map(k => obj[k]);
}

function convert_to_csv(values) {
  let val = "";
  if (values.length < 1)
    return "Zero rows returned";
  val += Object.keys(values[0]).join() + "\n";
  val += values.reduce((acc, v) => acc += utils.values_as_array(v, Object.keys(v)).join() + "\n", "");
  return val;
}

function fill_default_values(obj, fieldsZip) {
  fieldsZip.forEach(z => obj[z[0]] = obj[z[0]] === undefined ? obj[z[0]] : z[1]); 
  return obj;
}

module.exports = {
  before: before,
  boolean_fold: boolean_fold,
  build_filename: build_filename,
  contains: contains,
  convert_to_csv: convert_to_csv,
  fill_default_values: fill_default_values,
  filter_keys: filter_keys,
  iterate_on_keys: iterate_on_keys,
  object_has_key: object_has_key,
  object_has_keys: object_has_keys,
  parse_boolean: parse_boolean,
  unzip: unzip,
  values_as_array: values_as_array,
  zip: zip,
}