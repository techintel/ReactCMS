const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { compiledModels } = require('../models');

function authenticate(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  let token;

  if (authorizationHeader)
    token = authorizationHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Failed to authenticate' });
      } else {

        compiledModels[decoded.collectionPrefix].User.findOne({
          _id: ObjectId(decoded.id)
        }, '-hash',
        (err, user) => {
          if (!user) {
            res.status(404).json({ error: 'No such user' });
          } else {
            req.currentUser = Object.assign(user, { collectionPrefix: decoded.collectionPrefix });
            next();
          }
        });

      }
    });
  } else {
    res.status(403).json({
      error: 'No token provided'
    });
  }
}

module.exports = authenticate;
