const HueBridgeConnector = require('../../services/hue_bridge_connector');
const chai = require('chai');
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
      assert(!bridgeConnector.registered());
      bridgeConnector.register().then(() => {
        // TODO nock
        assert(bridgeConnector.registered());
        done();
      }).catch(done);
    });
  });

  describe('registered', () => {
    it('return false when it havent a username', (done) => {
      bridgeConnector.username = null;
      assert(!bridgeConnector.registered());
      done();
    });

    it('return true when it have a username', (done) => {
      bridgeConnector.username = faker.random.uuid();
      assert(bridgeConnector.registered());
      done();
    });
  });
});
