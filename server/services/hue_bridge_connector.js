const mongoose = require('mongoose');
const config = require('../config');
const HueBridgeConfiguration = require('../models/hue_bridge_configuration');

mongoose.connect(config.database, { useMongoClient: true });
mongoose.Promise = Promise;


class HueBridgeConnector {
  constructor() {
    HueBridgeConfiguration.find((error, bridgeConfigurations) => {
      if (error) { throw error; }
      if (bridgeConfigurations[0]) {
        this.bridge = bridgeConfigurations[0].host;
      }
    });
  }

  isRegistered() {
    return !!this.bridge;
  }

  async register() {
    const bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
    await bridge.save();
    this.bridge = bridge;
  }
}

module.exports = HueBridgeConnector;
