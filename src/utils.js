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
    ary1.push(ary_of_2_n_arys[i][0]);
    ary2.push(ary_of_2_n_arys[i][1]);
  }
  return { array1: ary1, array2: ary2 };
}

function ordering(a, b) {
  if (a < b)
    return 'LT';
  if (a > b) {
    return 'GT';
  }
  return 'EQ';
}

function object_has_key(obj, key) {
  return contains(Object.keys(obj), key);
}

function iterate_on_keys(obj, func) {
  Object.keys(obj).forEach(k => func(obj, k));
  return obj;
}

function filter_keys(obj, keep_keys) {
  let val = iterate_on_keys(obj, (o, k) => {
    if (!contains(keep_keys, k)) delete o[k];
  });
  /* If keep keys has too many keys, then somehow we are trying to filter with the wrong instrument fields */
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

function contains(ary, val) {
  return ary.indexOf(val) != -1;
}

function values_as_array(obj, keys) {
  return keys.map(k => obj[k]);
}

module.exports = {
  zip: zip,
  unzip: unzip,
  object_has_key: object_has_key,
  iterate_on_keys: iterate_on_keys,
  filter_keys: filter_keys,
  contains: contains,
  values_as_array: values_as_array
}