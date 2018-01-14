const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const faker = require('faker');
const HueBridgeConfiguration = require('../../models/hue_bridge_configuration');
const HueBridgeConnector = require('../../services/hue_bridge_connector');
const nock = require('nock');

const { assert } = chai;

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('HueBridgeConnector', () => {
  let bridgeConnector = null;

  beforeEach(async () => {
    nock.disableNetConnect();

    const bridgeConfiguration = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
    bridgeConnector = new HueBridgeConnector(bridgeConfiguration);
  });

  afterEach(async () => {
    nock.enableNetConnect();
  });

  describe('load', () => {
    beforeEach(async () => {
      const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
      bridgeConfigurations.forEach((bridge) => {
        bridge.remove();
      });
    });

    it('return a connector without configuration when none are present in the database', async () => {
      bridgeConnector = await HueBridgeConnector.load();
      assert(!bridgeConnector.isRegistered());
    });

    it('return a connector with configuration if there is one in the database', async () => {
      const bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
      await bridge.save();

      bridgeConnector = await HueBridgeConnector.load();
      assert(bridgeConnector.isRegistered());
    });
  });

  describe('isRegistered', () => {
    it('return false when it havent a username', async () => {
      bridgeConnector.bridgeConfiguration = null;

      assert(!bridgeConnector.isRegistered());
    });

    it('return true when it have a username', async () => {
      bridgeConnector.bridgeConfiguration = new HueBridgeConfiguration({ host: '192.168.178.52', username: faker.random.uuid() });

      assert(bridgeConnector.isRegistered());
    });
  });

  describe('register', () => {
    beforeEach(async () => {
      const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
      bridgeConfigurations.forEach((bridge) => {
        bridge.remove();
      });
    });

    it('raise an error if the button was not pressed', async () => {
      const meethueCall = nock('https://www.meethue.com:443').get('/api/nupnp').reply(200, [{ id: '001788fffe7cad63', internalipaddress: '192.168.178.52' }]);
      const postApiCall = nock('http://192.168.178.52:80')
        .post('/api', { devicetype: 'hue-home-controller' })
        .reply(200, [{ error: { type: 101, address: '', description: 'link button not pressed' } }]);

      bridgeConnector = new HueBridgeConnector();

      assert(!bridgeConnector.isRegistered());
      await assert.isRejected(bridgeConnector.register(), /link button not pressed/);
      assert(!bridgeConnector.isRegistered());

      meethueCall.done();
      postApiCall.done();
    });

    it('create a user on the bridge and save it if the button was pressed', async () => {
      const meethueCall = nock('https://www.meethue.com:443').get('/api/nupnp').reply(200, [{ id: '001788fffe7cad63', internalipaddress: '192.168.178.52' }]);
      const postApiCall = nock('http://192.168.178.52:80')
        .post('/api', { devicetype: 'hue-home-controller' })
        .reply(200, [{ success: { username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' } }]);

      bridgeConnector = new HueBridgeConnector();

      assert(!bridgeConnector.isRegistered());
      await bridgeConnector.register();
      assert(bridgeConnector.isRegistered());
      assert.equal('192.168.178.52', bridgeConnector.bridgeConfiguration.host);
      assert.equal('6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z', bridgeConnector.bridgeConfiguration.username);

      const bridgeConfigurations = await HueBridgeConfiguration.find().exec();

      assert.equal(1, bridgeConfigurations.length);
      assert.equal(bridgeConnector.bridgeConfiguration.host, bridgeConfigurations[0].host);
      assert.equal(bridgeConnector.bridgeConfiguration.username, bridgeConfigurations[0].username);

      meethueCall.done();
      postApiCall.done();
    });
  });

  describe('lights', () => {
    it('return the lights', async () => {
      nock('http://192.168.178.52:80', { encodedQueryParams: true })
        .get('/api/6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z/lights')
        .reply(200, {
          1: {
            state: {
              on: true, bri: 23, hue: 8403, sat: 140, effect: 'none', xy: [0.4575, 0.4099], ct: 366, alert: 'lselect', colormode: 'xy', mode: 'homeautomation', reachable: true,
            },
            swupdate: { state: 'noupdates', lastinstall: '2017-12-29T20:06:13' },
            type: 'Extended color light',
            name: 'Anna',
            modelid: 'LCT015',
            manufacturername: 'Philips',
            capabilities: { streaming: { renderer: true, proxy: true } },
            uniqueid: '00:17:88:01:03:54:a9:5d-0b',
            swversion: '1.29.0_r21169',
            swconfigid: '3416C2DD',
            productid: 'Philips-LCT015-1-A19ECLv5',
          },
          2: {
            state: {
              on: false, bri: 254, hue: 8418, sat: 140, effect: 'none', xy: [0.4573, 0.41], ct: 366, alert: 'none', colormode: 'ct', mode: 'homeautomation', reachable: true,
            },
            swupdate: { state: 'noupdates', lastinstall: '2017-12-31T19:21:56' },
            type: 'Extended color light',
            name: 'Teresa',
            modelid: 'LCT015',
            manufacturername: 'Philips',
            capabilities: { streaming: { renderer: true, proxy: true } },
            uniqueid: '00:17:88:01:03:54:b5:8b-0b',
            swversion: '1.29.0_r21169',
            swconfigid: '3416C2DD',
            productid: 'Philips-LCT015-1-A19ECLv5',
          },
          3: {
            state: {
              on: false, bri: 1, hue: 6291, sat: 251, effect: 'none', xy: [0.5612, 0.4042], ct: 500, alert: 'lselect', colormode: 'xy', mode: 'homeautomation', reachable: true,
            },
            swupdate: { state: 'noupdates', lastinstall: '2017-12-29T20:06:08' },
            type: 'Extended color light',
            name: 'Helena',
            modelid: 'LCT015',
            manufacturername: 'Philips',
            capabilities: { streaming: { renderer: true, proxy: true } },
            uniqueid: '00:17:88:01:03:54:b6:2b-0b',
            swversion: '1.29.0_r21169',
            swconfigid: '3416C2DD',
            productid: 'Philips-LCT015-1-A19ECLv5',
          },
        });

      const lights = await bridgeConnector.lights();
      assert.equal('1', lights[0].id);
      assert.equal(true, lights[0].state.on);
      assert.equal('Anna', lights[0].name);

      assert.equal('2', lights[1].id);
      assert.equal(false, lights[1].state.on);
      assert.equal('Teresa', lights[1].name);

      assert.equal('3', lights[2].id);
      assert.equal(false, lights[2].state.on);
      assert.equal('Helena', lights[2].name);
    });
  });
});
