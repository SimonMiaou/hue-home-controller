const express = require('express');

const app = express();


app.get('/api/state', (req, res) => {
  res.send({ express: 'Hello From Express' });
});


module.exports = app;
