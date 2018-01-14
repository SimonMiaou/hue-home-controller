const mongoose = require('mongoose');
const config = require('../config');
const HueBridgeConfiguration = require('../models/hue_bridge_configuration');

mongoose.connect(config.database, { useMongoClient: true });
mongoose.Promise = Promise;


class HueBridgeConnector {
  static async load() {
    const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
    if (bridgeConfigurations[0]) {
      return new HueBridgeConnector(bridgeConfigurations[0]);
    }
  }

  constructor(bridgeConfiguration) {
    this.bridgeConfiguration = bridgeConfiguration;
  }

  isRegistered() {
    return !!this.bridgeConfiguration;
  }

  async register() {
    const bridgeConfiguration = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
    await bridgeConfiguration.save();
    this.bridgeConfiguration = bridgeConfiguration;
  }
}

module.exports = HueBridgeConnector;
