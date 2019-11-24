const http = require('http');
const fs = require('fs');

const MESSAGE_TIMEOUT = 1000;// 60000; //60 seconds

const request_options = {
  hostname: 'localhost',
  port: '8000',
  path: '/api/sensor/update',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
}

let example_json = JSON.parse(fs.readFileSync(__dirname + '/data/1-25-19-DU1.json'));
let i = 0;
console.log(`Starting insert, example json has ${example_json.length} rows`);

let interval = setInterval(() => {
  if (i >= example_json.length) {
    clearInterval(interval);
    return;
  }
  let req = http.request(request_options, (res) => {
    console.log(`Got ${res.statusCode} ${res.statusMessage}`);
  });
  req.write(JSON.stringify(example_json[i]));
  i++;
  req.end();
}, MESSAGE_TIMEOUT);