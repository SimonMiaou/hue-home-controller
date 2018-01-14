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

    bridgeConnector = new HueBridgeConnector();

    done();
  });

  afterEach((done) => {
    nock.enableNetConnect();
    done();
  });

  describe('constructor', () => {
    it('fetch bridge configuration in the database', (done) => {
      HueBridgeConfiguration.find((error, bridgeConfigurations) => {
        if (error) { throw error; }
        bridgeConfigurations.forEach(bridge => bridge.remove());
      });

      const bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
      bridge.save().then(() => {
        assert(bridgeConnector.isRegistered());
        done();
      }).catch(done);
    });
  });

  describe('register', () => {
    it('create a user on the bridge and save it', (done) => {
      HueBridgeConfiguration.find((error, bridgeConfigurations) => {
        if (error) { throw error; }
        bridgeConfigurations.forEach(bridge => bridge.remove());
      });

      bridgeConnector = new HueBridgeConnector();

      assert(!bridgeConnector.isRegistered());
      bridgeConnector.register().then(() => {
        assert(bridgeConnector.isRegistered());

        HueBridgeConfiguration.find((error, bridgeConfigurations) => {
          if (error) { throw error; }
          assert.equal(1, bridgeConfigurations.length);
          assert.equal(bridgeConnector.bridge.host, bridgeConfigurations[0].host);
          assert.equal(bridgeConnector.bridge.username, bridgeConfigurations[0].username);

          done();
        });
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
