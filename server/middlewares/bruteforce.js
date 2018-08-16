const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');

const { bruteForceModel } = require('../models');
const store = new MongooseStore(bruteForceModel);

const bruteforce = new ExpressBrute(store, {
  freeRetries: 100,
});

module.exports = bruteforce;
