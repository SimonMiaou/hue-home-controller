const hue = require('node-hue-api');
const nock = require('nock');

const HueApi = require('node-hue-api').HueApi;

const hueApi = new HueApi();


nock.recorder.rec();


hue.nupnpSearch().then((bridges) => {
  console.log(bridges);


  const host = bridges[0].ipaddress;
  const userDescription = 'hue-home-controller';
  console.log(host);
  console.log(userDescription);


  hueApi.registerUser(host, userDescription)
    .then(displayUserResult)
    .fail(displayError)
    .done();
});


nock('http://192.168.178.52:80')
  .post('/api', { devicetype: 'hue-home-controller' })
  .reply(200, [{ error: { type: 101, address: '', description: 'link button not pressed' } }]);


nock('http://192.168.178.52:80')
  .post('/api', { devicetype: 'hue-home-controller' })
  .reply(200, [{ success: { username: '6K80BvWnjuuV5sE0VmWnk2JEwn0oJqWmeEYRXj6z' } }]);
