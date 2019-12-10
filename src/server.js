require('dotenv').config({ path: __dirname + '/config/.web.env'});

const CreateApp = require('./app');
const db = require('./db');
const utils = require('./utils');

const express = require('express');
const cors = require('cors');
const moment = require('moment');
const helmet = require('helmet');

const https = require('https');
const http = require('http');

const app = CreateApp(express, cors, moment, helmet, db, utils);

const httpServer = http.createServer(app);
httpServer.listen(process.env.SERVE_PORT || 8000, () => console.log('Server online.'));

if (process.env.SERVE_HTTPS) {
  const privateKey = 'false'; // Replace with fs readFileSync and cert location
  const certificate = 'false';
  
  const HTTPS_CREDENTIALS = {
    key: 'false',
    cert: 'false'
  };

  const httpsServer = https.createServer(HTTPS_CREDENTIALS, app);
  
  httpsServer.listen(process.env.HTTPS_SERVE_PORT || 8443, () => console.log('HTTPS Server online.'));
}