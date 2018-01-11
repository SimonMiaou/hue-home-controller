const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { assert } = chai;

chai.use(chaiHttp);


describe('Auth', () => {
  beforeEach((done) => {
    done();
  });

  describe('/GET /api/auth', () => {
    it('return a 200', (done) => {
      chai.request(app)
        .get('/api/auth')
        .end((err, res) => {
          assert.equal(res.status, 200);
          console.log(res.body);
          done();
        });
    });
  });
});
