const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HueBridgeConfiguration = require('../../models/hue_bridge_configuration');
const nock = require('nock');

const { assert } = chai;

chai.use(chaiHttp);


describe('/api/lights', () => {
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

      it('return an error', async () => {
        await chai.request(app)
          .get('/api/lights')
          .catch((error) => {
            assert.equal(500, error.status);
            assert.equal('no bridge registered', error.response.body.error);
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

        await chai.request(app)
          .get('/api/lights')
          .then((response) => {
            lightsCall.done();

            assert.equal(200, response.status);
            // TODO test body
          });
      });
    });
  });
});
