const fs = require('fs');
const path = require('path');


const NODE_ENV = process.env.NODE_ENV;
let configBuffer = null;

if (NODE_ENV) {
  configBuffer = fs.readFileSync(path.resolve(__dirname, `${NODE_ENV}.json`), 'utf-8');
} else {
  throw new Error('Please set NODE_ENV');
}

const config = JSON.parse(configBuffer);
module.exports = config;
