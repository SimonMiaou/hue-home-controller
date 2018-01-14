const app = require('../app');
const chai = require('chai');
const nock = require('nock');
const chaiHttp = require('chai-http');

const { assert } = chai;

chai.use(chaiHttp);


describe('Auth', () => {
  beforeEach((done) => {
    nock.disableNetConnect();
    nock.enableNetConnect(/127\.0\.0\.1/);
    done();
  });

  afterEach((done) => {
    nock.enableNetConnect();
    done();
  });

  describe('/GET /api/auth', () => {
    it('return a 200', (done) => {
      nock('https://www.meethue.com:443').get('/api/nupnp').reply(200, [{ id: '001788fffe7cad63', internalipaddress: '192.168.178.52' }]);

      chai.request(app)
        .get('/api/auth')
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
