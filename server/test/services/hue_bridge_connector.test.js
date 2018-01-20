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
      await Promise.all(bridgeConfigurations.map(bridge => bridge.remove()));
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

  describe('bridge', () => {
    it('return the current bridge', async () => {
      const bridgeCall = nock('http://192.168.178.52:80', { encodedQueryParams: true })
        .get('/api/6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z/config')
        .reply(200, {
          name: 'Camomille',
          zigbeechannel: 25,
          bridgeid: '001788FFFE7CAD63',
          mac: '00:17:88:7c:ad:63',
          dhcp: true,
          ipaddress: '192.168.178.52',
          netmask: '255.255.255.0',
          gateway: '192.168.178.1',
          proxyaddress: 'none',
          proxyport: 0,
          UTC: '2018-01-15T22:04:43',
          localtime: '2018-01-15T23:04:43',
          timezone: 'Europe/Berlin',
          modelid: 'BSB002',
          datastoreversion: '65',
          swversion: '1711151408',
          apiversion: '1.22.0',
          swupdate: {
            updatestate: 0, checkforupdate: false, devicetypes: { bridge: false, lights: [], sensors: [] }, url: '', text: '', notify: true,
          },
          swupdate2: {
            checkforupdate: false, lastchange: '2017-12-31T19:22:08', bridge: { state: 'noupdates', lastinstall: '2017-12-29T18:49:41' }, state: 'noupdates', autoinstall: { updatetime: 'T12:00:00', on: true },
          },
          linkbutton: false,
          portalservices: true,
          portalconnection: 'connected',
          portalstate: {
            signedon: true, incoming: false, outgoing: true, communication: 'disconnected',
          },
          internetservices: {
            internet: 'connected', remoteaccess: 'connected', time: 'connected', swupdate: 'connected',
          },
          factorynew: false,
          replacesbridgeid: null,
          backup: { status: 'idle', errorcode: 0 },
          starterkitid: '',
          whitelist: {
            '4h0IPInK9TEgITxQ0hoZhpHMvKhb4WbVShSaOuin': { 'last use date': '2018-01-15T22:04:43', 'create date': '2017-12-29T18:47:24', name: 'Hue 2#Google Pixel 2 XL' }, DZmhBdNL4Xg1YgXlWgVEizRVikOZqHEWsfzyDOwO: { 'last use date': '2018-01-15T20:19:43', 'create date': '2017-12-29T19:26:41', name: 'hue-hca-actions-on-google' }, 'hSDyb-RfFgLwCInzaqXL10rksu8HpdnsmdQNo281': { 'last use date': '2017-12-31T17:49:40', 'create date': '2017-12-29T21:55:15', name: 'iftttv2' }, '6eKiHfACV5jlFAP8-KO4nkmW93vnJU1dh2nv6g2v': { 'last use date': '2018-01-15T22:04:43', 'create date': '2017-12-30T00:07:11', name: 'Hue 2#OnePlus ONE A2003' }, 'yj0GHyq0i4cFTxvhgtrV50I-YkLPl6hukm5Rz-sC': { 'last use date': '2018-01-15T20:19:43', 'create date': '2017-12-31T20:15:42', name: 'HueSwitcher#Pixel 2 XL' }, '8iyXKaG8ImDZrdHSb7N55jCfukhnA4W0uga-tioc': { 'last use date': '2018-01-07T14:04:42', 'create date': '2018-01-07T13:50:44', name: 'ScreenBloom' }, ZLlA0Y8lF3Bld71iQdJGWOmEtaplLc2pLEW8S8Ii: { 'last use date': '2018-01-07T14:19:42', 'create date': '2018-01-07T13:55:11', name: 'ScreenBloom' }, '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z': { 'last use date': '2018-01-15T22:04:43', 'create date': '2018-01-13T20:08:05', name: 'hue-home-controller' },
          },
        });

      const bridge = await bridgeConnector.bridge();

      bridgeCall.done();

      assert.equal('Camomille', bridge.name);
      assert.equal('001788FFFE7CAD63', bridge.bridgeid);
      assert.equal('00:17:88:7c:ad:63', bridge.mac);
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
      await Promise.all(bridgeConfigurations.map(bridge => bridge.remove()));
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
      const lightsCall = nock('http://192.168.178.52:80', { encodedQueryParams: true })
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
      lightsCall.done();

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
