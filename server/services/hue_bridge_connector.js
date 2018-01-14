const config = require('../config');

class HueBridgeConnector {
  constructor() {
    this.username = null;
  }

  async register() {
    this.username = 'abc';
  }

  registered() {
    return !!this.username;
  }
}

module.exports = HueBridgeConnector;
