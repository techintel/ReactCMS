const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils');
const { SALT_ROUNDS, JWT_SECRET } = require('../config');

const { Site, compiledModels } = require('../models');
const assert = require('assert');

Site.find().then((sites) => {

  router.post('/', (req, res, next) => {
    const { collectionPrefix, username, password, code, validate } = req.body;
    const email = req.body.email.toLowerCase();
    const site = _.find(sites, { _id: { collectionPrefix } });
    const errors = {};

    if ( collectionPrefix !== "" && !/^\w+$/.test(collectionPrefix) )
      errors.collectionPrefix = 'Only empty string or a combination of letters, numbers and an underscore are allowed!';
    else if ( site === undefined )
      errors.collectionPrefix = 'The site with the requested collectionPrefix didn\'t exist!';

    if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email) )
      errors.email = 'Invalid email address';
    if ( !/^[A-Z0-9_-]+$/i.test(username) )
      errors.username = 'Invalid username';
    if ( password === "" )
      errors.password = 'Invalid password';
    if ( code === "" )
      errors.code = 'Invalid verification code';
    if ( !_.isEmpty(errors) )
      return res.status(401).json({ errors });

    if (validate) { // For asynchronous validation.

      compiledModels[collectionPrefix].User
      .findOne( { username },
        (err, doc) => {
          assert.ifError(err);

          if (doc !== null) {
            errors.username = 'Username is not available';
            res.status(401);
          }
          res.json({ errors });
        }
      );

    } else { // For form submission.

      if (!code) {
        if (password) { // Login

          compiledModels[collectionPrefix].User
          .findOne( { email },
            (err, doc) => {
              assert.ifError(err);

              if (doc !== null) {

                // Load hash from the user DB.
                bcrypt.compare(password, doc.hash, (err, isMatched) => {
                  assert.ifError(err);

                  if (isMatched) { // Password and stored hash are matched.
                    const token = jwt.sign({
                      collectionPrefix,
                      id: doc._id,
                      username: doc.username,
                      role: doc.role
                    }, JWT_SECRET);

                    res.json({ token });

                  } else { // Password and stored hash did not matched.
                    res.status(401).json({
                      errors: { password: 'Invalid credentials' }
                    });
                  }

                });

              }
            }
          );

        } else { // Check if the requested email is used.

          const query = { email: {
            $regex: new RegExp(`^${email}$`, 'i')
          } };

          compiledModels[collectionPrefix].User
          .findOne( query,
            (err, doc) => {
              assert.ifError(err);

              const isEmailUsed = (doc !== null);
              const state = { email, isEmailUsed };

              if (!isEmailUsed) {
                const generatedCode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                compiledModels[collectionPrefix].Unverified
                .updateOne( { email },
                  {
                    email,
                    code: generatedCode,
                    expires: tomorrow
                  },
                  { upsert: true, setDefaultsOnInsert: true },
                  (err, doc) => {
                    assert.ifError(err);

                    const subject = `${generatedCode} is your ${site.title} verification code`;
                    const content = `
                      <p>Confirm your email address for your ${site.title} account.<br />
                      Please enter the code below to be able to complete your account registration:</p>
                      <code style="font-weight: 700; font-size: 32px;">${generatedCode}</code>
                    `;

                    sendMail(email, subject, content, site, (isSent) => {
                      state.isVerificationSent = isSent;
                      res.json({ state });
                    });
                  }
                );
              } else {
                res.json({ state });
              }

            }
          );

        }
      } else {

        if ( username === undefined && password === undefined ) { // Confirm the requested verification code.

          compiledModels[collectionPrefix].Unverified
          .findOne({
            email, code,
            expires: { "$gt": Date.now() }
          }, (err, doc) => {
            assert.ifError(err);

            res.status((doc === null) ? 401 : 200).json({
              state: { email,
                isVerified: (doc !== null)
              },
              errors: (doc === null) ? {
                code: 'Wrong verification code!'
              } : null
            });
          });

        } else { // Remove from `Unverified` and register the account.

          compiledModels[collectionPrefix].Unverified
          .findOne({
            email, code,
            expires: { "$gt": Date.now() }
          }, (err, unverifiedUser) => {
            assert.ifError(err);

            if (unverifiedUser !== null) {
              compiledModels[collectionPrefix].User
              .findOne( { username },
                (err, existingUser) => {
                  assert.ifError(err);

                  // Username is not being used, create an account.
                  if (existingUser === null) {
                    bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
                      bcrypt.hash(password, salt, function(err, hash) {
                        assert.ifError(err);

                        // Store hash in the user DB.
                        compiledModels[collectionPrefix].User
                        .create({
                          email: unverifiedUser.email,
                          username,
                          hash
                        }, (err, createdUser) => {
                          assert.ifError(err);

                          const token = jwt.sign({
                            collectionPrefix,
                            id: createdUser._id,
                            username: createdUser.username,
                            role: createdUser.role
                          }, JWT_SECRET);

                          res.json({ token });
                        });

                      });
                    });
                  } else { // Username is being used.
                    res.status(401).json({
                      errors: { username: 'Username is not available' }
                    });
                  }

                }
              );
            }

          });

        }

      }

    }
  });

});

module.exports = router;
