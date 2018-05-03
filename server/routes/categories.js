const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { MANAGE_CATEGORIES } = require('./capabilities');
const { find } = require('lodash');
const assert = require('assert');
const { Site } = require('../models');
const { havePermission, toSlug } = require('../utils');

const compiledModels = [];

router.post('/add', authenticate, (req, res, next) => {
  const { body, currentUser } = req;

  if ( !havePermission(currentUser, MANAGE_CATEGORIES, res) ) {
    return res.status(403).json({
      errors: {
        _error: "You don't have permission"
      }
    });
  }

  const { domain, name } = body;
  const siteDomain = domain ? domain : "";
  const slug = toSlug(
    body.slug ? body.slug : name
  );

  Site.findOne(
    { '_id.domain': siteDomain },
    (err, doc) => {
      assert.ifError(err);

      if (doc) {
        const currentCategories = doc.categories ? doc.categories : [];
        const newCategory = { name, slug };

        if (
          !find(currentCategories, o => {
            return (o.name === name || o.slug === slug)
          })
        ) {
          const newCategories = [...currentCategories, newCategory];

          Site.findOneAndUpdate(
            { '_id.domain': siteDomain },
            { $set: { categories: newCategories } },
            { new: true },
            (err, doc) => {
              assert.ifError(err);

              if (doc) {
                res.status(201).json(newCategory);
              }
            }
          );
        } else {
          res.status(409).json({
            errors: {
              name: 'Duplicate category'
            }
          });
        }

      }

    }
  );

});

module.exports = router;
