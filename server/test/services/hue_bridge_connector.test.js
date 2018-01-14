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

    const bridgeConfiguration = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
    this.bridgeConnector = new HueBridgeConnector(bridgeConfiguration);

    done();
  });

  afterEach((done) => {
    nock.enableNetConnect();
    done();
  });

  describe('load', () => {
    it('fetch bridge configuration from the database', async () => {
      const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
      bridgeConfigurations.forEach((bridge) => {
        bridge.remove();
      });

      const bridge = new HueBridgeConfiguration({ host: '192.168.178.52', username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' });
      await bridge.save();

      const bridgeConnector = await HueBridgeConnector.load();
      assert(bridgeConnector.isRegistered());
    });
  });

  describe('register', () => {
    it('create a user on the bridge and save it', async () => {
      const bridgeConfigurations = await HueBridgeConfiguration.find().exec();
      bridgeConfigurations.forEach((bridge) => {
        bridge.remove();
      });

      bridgeConnector = new HueBridgeConnector();

      assert(!bridgeConnector.isRegistered());

      await bridgeConnector.register().then(() => {
        assert(bridgeConnector.isRegistered());

        HueBridgeConfiguration.find((error, bridgeConfigurations) => {
          if (error) { throw error; }

          assert.equal(1, bridgeConfigurations.length);
          assert.equal(bridgeConnector.bridgeConfiguration.host, bridgeConfigurations[0].host);
          assert.equal(bridgeConnector.bridgeConfiguration.username, bridgeConfigurations[0].username);
        });
      });
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
});
