import Axios from "axios"

const INTERVAL_TIME = 10000;

let worker = {
  latestData: [],
  sendResult: (value) => {
    postMessage(value);
  },
  create: () => {
    return self.setInterval(() => {
      [1,2,3].forEach((n) => {
        worker.sendResult({
          'sensorId': `CM${n}`,
          'PM2_5': Math.pow(Math.random(n) * 10, Math.random(n) * 2),
          'Time': `${Date.now()}`
        })
      });
      // Axios.get('/api/sensor/all').then(response => {
      //   this.latestData = response.data.data;
      //   this.sendResult(this.latestData);
      // }).catch(error => {
      //   console.error("Worker shutting down", error);
      //   self.clearInterval(worker.interval);
      // });
    }, INTERVAL_TIME);
  }
}

onmessage = function(event) {
  if (event.data === 'startup') {
    console.info("Worker starting up");
    worker.interval = worker.create();
  } else if (event.data === 'shutdown') {
    console.info("Worker shutting down");
    self.clearInterval(worker.interval);
  }
}