const config = require('../config');
const hue = require('node-hue-api');
const HueBridge = require('../models/hue_bridge');
const HueBridgeConfiguration = require('../models/hue_bridge_configuration');
const HueLight = require('../models/hue_light');
const mongoose = require('mongoose');
const { HueApi } = require('node-hue-api');

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

  api() {
    if (!this.isRegistered()) { throw new Error('no bridge registered'); }
    return new HueApi(this.bridgeConfiguration.host, this.bridgeConfiguration.username);
  }

  async bridge() {
    const api = this.api();
    return api.config().then(bridge => new HueBridge(api, bridge));
  }

  isRegistered() {
    return !!this.bridgeConfiguration;
  }

  async lights() {
    const api = this.api();
    return api.lights().then(result => result.lights.map(light => new HueLight(api, light)));
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
