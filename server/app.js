const express = require('express');
const hue = require('node-hue-api');
const redis = require('redis');
const { HueApi } = require('node-hue-api');

const app = express();


app.get('/api/auth', (req, res) => {
  const client = redis.createClient();
  client.on('error', (error) => { console.log(`Redis error: ${error}`); });

  let bridgeHost = null;
  let bridgeUsername = null;

  client.get('bridge_host', (errorBridgeHost, resBridgeHost) => {
    if (errorBridgeHost) {
      res.status(500).send(errorBridgeHost);
      client.quit();
    } else {
      bridgeHost = resBridgeHost;

      client.get('bridge_username', (errorBridgeUsername, resBridgeUsername) => {
        if (errorBridgeUsername) {
          res.status(500).send(errorBridgeUsername);
        } else {
          bridgeUsername = resBridgeUsername;

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
        }
        client.quit();
      });
    }
  });
});


module.exports = app;
