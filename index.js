// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const open = require('open');
const path = require('path');
const history = require('connect-history-api-fallback');
// -----------------------------------CONFIG-------------------------------
const app = express();
const port = process.env.PORT || 4000
const serveClient = express.static(path.join(__dirname, 'client')); // serve static files
const serveMaster = express.static(path.join(__dirname, 'master')); // serve static files
const logs = true;
// -----------------------------------MIDDLEWARES-------------------------------
const optionsHystory = { 
  verbose: logs,
  rewrites: [
    { from: /\/master/, to: '/master/index.html'}
  ]
};
app.use(serveClient);
app.use('/master', serveMaster);
// -----------------------------------ROUTES-------------------------------
app.get('/', (req, res) => {
  res.render(__dirname + '/client/index.html');
});
app.get('/master', (req, res) => {
  res.render(__dirname + '/master/index.html');
});
// -----------------------------------ROUTES-------------------------------
app.use(history(optionsHystory));
app.use(serveClient);
app.use('/master', serveMaster);
// -----------------------------------SSL-------------------------------
const http = require('http');
const https = require('https');
const fs = require('fs');
const sslPath = process.env.SSL_PATH || null

let optionsSSL

try {
  if(sslPath)
    optionsSSL = {
      cert: fs.readFileSync(`${sslPath}/fullchain.pem`),
      key: fs.readFileSync(`${sslPath}/privkey.pem`)
    };
  else
    optionsSSL = {
      cert: fs.readFileSync(`./self-signed-certs/certificate.crt`),
      key: fs.readFileSync(`./self-signed-certs/certificate.key`)
    };
  console.log('exito cert: ', optionsSSL);
} catch (error) {
  optionsSSL = {};
  console.log('fallo cert: ', error);
}

const trySSL = process.env.USE_SSL || false // Set use of https from enviroment

const server = trySSL ? https : http
const options = trySSL ? optionsSSL : {}

// -----------------------------------SERVER-------------------------------
server
  .createServer(options, app)
  .listen(port, () => {
    console.log('https ', trySSL, ' listening to port ' + port + '...')
    // Open browser on local tests
    if( !sslPath && trySSL )
      open(`https://localhost:${port}/`);
    else if( !trySSL )
      open(`http://localhost:${port}/`);
  });
