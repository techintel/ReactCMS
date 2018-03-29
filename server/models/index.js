const mongoose = require('mongoose');
const {
  siteSchema
} = require('./schemas');

const Site = mongoose.model('Site', siteSchema);

module.exports = {
  Site
};
