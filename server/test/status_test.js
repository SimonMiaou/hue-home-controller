const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { assert } = chai;

chai.use(chaiHttp);


describe('State', () => {
  beforeEach((done) => {
    done();
  });

  describe('/GET book', () => {
    it('return a 200', (done) => {
      chai.request(app)
        .get('/api/state')
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
