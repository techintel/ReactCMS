const { Schema } = require('mongoose');

const siteSchema = new Schema({
  _id: {
    domain: {type: String, required: true},
    collectionPrefix: {type: String, required: true}
  },
  title: {type: String},
  description: {type: String}
});

const userSchema = new Schema({
  email: {type: String},
  username: {type: String},
  hash: {type: String},
  role: {type: String, default: 'subscriber'},
  created: {type: Date, default: Date.now},
  modified: {type: Date, default: Date.now}
});

const unverifiedSchema = new Schema({
  email: {type: String, required: true},
  code: {type: String, required: true},
  expires: {type: Date, required: true}
});

module.exports = {
  siteSchema,
  userSchema,
  unverifiedSchema
};
