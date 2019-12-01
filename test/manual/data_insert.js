const http = require('http');
const fs = require('fs');
const moment = require('moment');

const MESSAGE_TIMEOUT = 60000; //60 seconds
const NUM_SENSORS = 4;

const request_options = {
  hostname: 'localhost',
  port: '8000',
  path: '/api/sensor/update',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
};

let example_json = JSON.parse(fs.readFileSync(__dirname + '/../data/1-25-19-DU1.json'));
let i = 0;
console.log(`Starting insert, example json has ${example_json.length} rows`);

let interval = setInterval(() => {
  if (i >= example_json.length) {
    clearInterval(interval);
    return;
  }
  // Increase the number of sensors over time, cap at NUM_SENSORS
  let interval_max = Math.floor((10 * i) / example_json.length) + 1;
  for (let j = 0; j < interval_max && j < NUM_SENSORS; j++) {
    let req = http.request(request_options, (res) => {
      console.log(`Got ${res.statusCode} ${res.statusMessage} for sensor update Canary-S-DU${j+1}`);
    });
    let example_object = example_json[i];
    example_object['sensorID'] = `Canary-S-DU${j+1}`
    example_object['Time'] = moment().format();
    req.write(JSON.stringify(example_object));
    req.end();
  }
  i++;
}, MESSAGE_TIMEOUT);