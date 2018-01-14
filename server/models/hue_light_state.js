class HueLightState {
  constructor(attributes) {
    this.on = attributes.on;
    this.bri = attributes.bri;
    this.hue = attributes.hue;
    this.sat = attributes.sat;
    this.effect = attributes.effect;
    this.xy = attributes.xy;
    this.ct = attributes.ct;
    this.alert = attributes.alert;
    this.colormode = attributes.colormode;
    this.mode = attributes.mode;
    this.reachable = attributes.reachable;
  }
}

module.exports = HueLightState;
