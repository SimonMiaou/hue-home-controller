const HueLightState = require('./hue_light_state');

class HueLight {
  constructor(hueApi, attributes) {
    this.hueApi = hueApi;
    this.id = attributes.id;
    this.state = new HueLightState(attributes.state);
    this.type = attributes.type;
    this.name = attributes.name;
    this.modelid = attributes.modelid;
    this.manufacturername = attributes.manufacturername;
    this.uniqueid = attributes.uniqueid;
    this.productid = attributes.productid;
  }

  asJson() {
    return {
      id: this.id,
    };
  }
}

module.exports = HueLight;
