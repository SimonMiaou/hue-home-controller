const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HueBridgeConfiguration = require('../../models/hue_bridge_configuration');
const nock = require('nock');

const { assert } = chai;

chai.use(chaiHttp);


describe('/api/auth', () => {
  beforeEach(async () => {
    nock.disableNetConnect();
    nock.enableNetConnect(/127\.0\.0\.1/);
  });

  afterEach(async () => {
    nock.enableNetConnect();
  });

  describe('GET', () => {
    describe('when there is no bridge configuration', () => {
      beforeEach(async () => {
        const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
        await Promise.all(bridgeConfigurations.map(bridge => bridge.remove()));
      });

      it('return a 200 with auth to false', async () => {
        await chai.request(app)
          .get('/api/auth')
          .then((response) => {
            assert.equal(200, response.status);
            assert.equal(false, response.body.authenticated);
          });
      });
    });

    describe('when there is a bridge configuration', () => {
      beforeEach(async () => {
        const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
        await Promise.all(bridgeConfigurations.map(bridge => bridge.remove()));

        const bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
        await bridge.save();
      });

      it('return a 200 with host to true and hue bridge informations', async () => {
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

        await chai.request(app)
          .get('/api/auth')
          .then((response) => {
            bridgeCall.done();

            assert.equal(200, response.status);
            assert.equal(true, response.body.authenticated);
            assert.equal('Camomille', response.body.hue_bridge.name);
          });
      });
    });
  });

  describe('POST', () => {
    describe('when the button has not been pressed', () => {
      it('return an error', async () => {
        const meethueCall = nock('https://www.meethue.com:443').get('/api/nupnp').reply(200, [{ id: '001788fffe7cad63', internalipaddress: '192.168.178.52' }]);
        const postApiCall = nock('http://192.168.178.52:80')
          .post('/api', { devicetype: 'hue-home-controller' })
          .reply(200, [{ error: { type: 101, address: '', description: 'link button not pressed' } }]);

        await chai.request(app)
          .post('/api/auth')
          .catch((error) => {
            meethueCall.done();
            postApiCall.done();

            assert.equal(500, error.status);
            assert.equal('link button not pressed', error.response.body.error);
          });
      });
    });

    describe('when the button has been pressed', () => {
      it('register to the bridge', async () => {
        const meethueCall = nock('https://www.meethue.com:443').get('/api/nupnp').reply(200, [{ id: '001788fffe7cad63', internalipaddress: '192.168.178.52' }]);
        const postApiCall = nock('http://192.168.178.52:80')
          .post('/api', { devicetype: 'hue-home-controller' })
          .reply(200, [{ success: { username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' } }]);
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

        await chai.request(app)
          .post('/api/auth')
          .then((response) => {
            meethueCall.done();
            postApiCall.done();
            bridgeCall.done();

            assert.equal(200, response.status);
            assert.equal(true, response.body.authenticated);
            assert.equal('Camomille', response.body.hue_bridge.name);
          });
      });
    });
  });
});
