function zip(ary1, ary2) {
  let pairs = [];
  for (let i = 0; i < ary1.length; i++) {
    pairs.push([ary1[i], ary2[i]]);
  }
  return pairs;
}

module.exports = {
  zip: zip
}