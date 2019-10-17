require('dotenv').config()
const express = require('express');
const db = require('./db');
const app = express();
const port = 4000;

const logger = (req, res, next) => {
  console.log(`-> ${req.protocol} - ${req.method} - ${req.originalUrl}`);
  next();
}

app.use(logger);

app.use(express.static(__dirname + '/view'));

app.put('/api/sensor/update', (req, res) => {
  console.log("Got a put request to /api/sensor/update !");
});

app.get('/api/sensor/all', (req, res, next) => {
  db.query('SELECT NOW() as now', [], (err, result) => {
    if (err) {
      console.log(err.stack);
      next();
    } else {
      res.json({ now: result.rows[0] })
    }
  });
});

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 Internal Server Error');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

