let mongoose = require('mongoose');
const Config = require('../config.json');
mongoose.connect(Config.databaseUrl, { useNewUrlParser: true });
module.exports = mongoose;