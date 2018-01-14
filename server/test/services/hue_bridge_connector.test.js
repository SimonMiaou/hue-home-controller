const HueBridgeConnector = require('../../services/hue_bridge_connector');
const chai = require('chai');
const HueBridgeConfiguration = require('../../models/hue_bridge_configuration');
const nock = require('nock');
const faker = require('faker');
const chaiHttp = require('chai-http');

const { assert } = chai;

chai.use(chaiHttp);

describe('HueBridgeConnector', () => {
  let bridgeConnector = null;

  beforeEach((done) => {
    nock.disableNetConnect();
    nock.enableNetConnect(/127\.0\.0\.1/);

    bridgeConnector = new HueBridgeConnector();

    HueBridgeConfiguration.find((error, bridgeConfigurations) => {
      if (error) { throw error; }
      bridgeConfigurations.forEach((bridge) => {
        bridge.remove();
      });
    });

    done();
  });

  afterEach((done) => {
    nock.enableNetConnect();
    done();
  });

  describe('constructor', () => {
    it('fetch username in the database', (done) => {
      // TODO

      done();
    });
  });

  describe('register', () => {
    it('Create a user on the bridge', (done) => {
      assert(!bridgeConnector.isRegistered());
      bridgeConnector.register().then(() => {
        // TODO nock
        assert(bridgeConnector.isRegistered());
        done();
      }).catch(done);
    });
  });

  describe('isRegistered', () => {
    it('return false when it havent a username', (done) => {
      bridgeConnector.bridge = null;
      assert(!bridgeConnector.isRegistered());
      done();
    });

    it('return true when it have a username', (done) => {
      bridgeConnector.bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: faker.random.uuid() });
      assert(bridgeConnector.isRegistered());
      done();
    });
  });
});
