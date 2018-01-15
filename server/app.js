const express = require('express');
const HueBridgeConnector = require('./services/hue_bridge_connector');

const app = express();


app.get('/api/auth', async (req, res) => {
  const bridgeConnector = await HueBridgeConnector.load();

  if (bridgeConnector.isRegistered()) {
    const bridge = await bridgeConnector.bridge();
    res.send({ auth: true, hue_bridge: bridge.asJson() });
  } else {
    res.send({ auth: false });
  }
});


module.exports = app;
