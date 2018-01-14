const express = require('express');
const hue = require('node-hue-api');
const { HueApi } = require('node-hue-api');

const app = express();


app.get('/api/auth', (req, res) => {
  const bridgeHost = null;
  const bridgeUsername = null;


  if (bridgeHost && bridgeUsername) {
    const hueApi = new HueApi(bridgeHost, bridgeUsername);

    hueApi.config().then((result) => {
      res.send({ auth: true, result });
    });
  } else {
    hue.nupnpSearch().then((bridges) => {
      res.send({ auth: false, bridges });
    });
  }
});


module.exports = app;
