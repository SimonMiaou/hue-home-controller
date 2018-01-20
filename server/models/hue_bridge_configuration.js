const mongoose = require('mongoose');

const schema = mongoose.Schema({ host: String, username: String });
const HueBridgeConfiguration = mongoose.model('HueBridgeConfiguration', schema);

module.exports = HueBridgeConfiguration;
