const config = require('../config');
const hue = require('node-hue-api');
const { HueApi } = require('node-hue-api');
const HueBridgeConfiguration = require('../models/hue_bridge_configuration');
const mongoose = require('mongoose');

mongoose.connect(config.database, { useMongoClient: true });
mongoose.Promise = Promise;


class HueBridgeConnector {
  static async load() {
    const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
    if (bridgeConfigurations[0]) {
      return new HueBridgeConnector(bridgeConfigurations[0]);
    }
    return new HueBridgeConnector();
  }

  constructor(bridgeConfiguration) {
    this.bridgeConfiguration = bridgeConfiguration;
  }

  isRegistered() {
    return !!this.bridgeConfiguration;
  }

  async register() {
    const bridges = await hue.nupnpSearch();
    if (bridges.length === 0) { throw new Error('No bridge was found'); }

    const host = bridges[0].ipaddress;
    const hueApi = new HueApi();
    const userDescription = 'hue-home-controller';
    const username = await hueApi.registerUser(host, userDescription);

    const bridgeConfiguration = new HueBridgeConfiguration({ host, username });
    await bridgeConfiguration.save();
    this.bridgeConfiguration = bridgeConfiguration;
  }
}

module.exports = HueBridgeConnector;
