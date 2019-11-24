function zip(ary1, ary2) {
  let pairs = [];
  for (let i = 0; i < ary1.length; i++) {
    pairs.push([ary1[i], ary2[i]]);
  }
  return pairs;
}

function object_has_key(obj, key) {
  return contains(Object.keys(obj), key);
}

function iterate_on_keys(obj, func) {
  Object.keys(obj).forEach(k => func(obj, k));
  return obj;
}

function filter_keys(obj, keep_keys) {
  return iterate_on_keys(obj, (o, k) => {
    if (!contains(keep_keys, k)) delete o[k];
  });
}

function contains(ary, val) {
  return ary.indexOf(val) != -1;
}

function values_as_array(obj, keys) {
  return keys.map(k => obj[k]);
}

module.exports = {
  zip: zip,
  object_has_key: object_has_key,
  filter_keys: filter_keys,
  contains: contains,
  values_as_array: values_as_array
}