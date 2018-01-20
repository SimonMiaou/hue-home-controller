const express = require('express');
const HueBridgeConnector = require('./services/hue_bridge_connector');

const app = express();


app.route('/api/auth')
  .get(async (req, res) => {
    const bridgeConnector = await HueBridgeConnector.load();

    if (bridgeConnector.isRegistered()) {
      const bridge = await bridgeConnector.bridge();
      res.send({ authenticated: true, hue_bridge: bridge.asJson() });
    } else {
      res.send({ authenticated: false });
    }
  })
  .post(async (req, res) => {
    try {
      const bridgeConnector = await HueBridgeConnector.load();

      await bridgeConnector.register();
      const bridge = await bridgeConnector.bridge();
      res.send({ authenticated: true, hue_bridge: bridge.asJson() });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

app.route('/api/lights')
  .get(async (req, res) => {
    try {
      const bridgeConnector = await HueBridgeConnector.load();

      const lights = await bridgeConnector.lights();
      res.send({ lights: lights.map(light => light.asJson()) });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });


module.exports = app;
