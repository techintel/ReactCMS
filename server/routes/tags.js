const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { isEmpty } = require('lodash');
const { retrieveAncestors, toSlug } = require('../utils');
const { isUserCapable } = require('../utils/reactcms');

const { compiledModels } = require('../models');
const assert = require('assert');

router.post('/add', authenticate, (req, res, next) => {
  const { currentUser, originalUrl } = req;
  const appDir = originalUrl.split("/").slice(-2, -1).toString();
  const { _id, name, description, parent } = req.body;
  const slug = toSlug( req.body.slug ? req.body.slug : name );
  const errors = {};

  if ( !isUserCapable('manage', 'category', currentUser) )
    return res.sendStatus(403);

  if ( !name || !name.match(/[a-z]/i) )
    errors.name = 'Please enter some name.';
  if ( !isEmpty(errors) )
    return res.status(401).json({ errors });

  const model = (appDir === 'tags')
    ? compiledModels[currentUser.collectionPrefix].Tag
    : compiledModels[currentUser.collectionPrefix].Category;

  if ( !_id ) { // New tag
    model.findOne( { slug },
      (err, duplicate) => {
        assert.ifError(err);

        if (!duplicate) {
          const newTag = { name, slug, description };

          if (appDir === 'categories') {
            retrieveAncestors( model, parent, newTag, res, modified => {
              model.create( modified,
                (err, doc) => {
                  assert.ifError(err);

                  doc.populate({
                    path: 'ancestors'
                  }, (err, doc) => {
                    assert.ifError(err);
                    res.status(201).json(doc);
                  });
                }
              );
            });
          } else {
            model.create( newTag,
              (err, doc) => {
                assert.ifError(err);
                res.status(201).json(doc);
              }
            );
          }

        } else {
          errors.slug = 'Duplicate slug';
          res.status(409).json({ errors });
        }
      }
    );

  } else { // Modify tag
    model.findOne( { _id },
      (err, doc) => {
        assert.ifError(err);

        if (doc) {
          doc.name = name;
          doc.slug = slug;
          doc.description = description;

          if (appDir === 'categories') {
            const isParentUnique = (!parent && !doc.parent) ? false : (parent != doc.parent);
            const oldParent = doc.parent;

            retrieveAncestors( model, parent, doc, res, modified => {
              modified.save(err => {
                assert.ifError(err);

                if (isParentUnique) {
                  model.find( { ancestors: oldParent },
                    (err, docs) => {
                      assert.ifError(err);

                      docs.forEach(doc =>
                        retrieveAncestors( model, doc.parent, doc, res, modified =>
                          modified.save(err => assert.ifError(err))
                        )
                      );
                    }
                  );
                }

                modified.populate( { path: 'ancestors' }, err => {
                  assert.ifError(err);
                  res.json(modified);
                });
              });
            });
          } else { // if tags
            doc.save(err => {
              assert.ifError(err);
              res.json(doc);
            });
          }

        } else {
          res.sendStatus(404);
        }
      }
    );

  }
});

router.get('/', (req, res, next) => {
  const { originalUrl, query: { collectionPrefix, slug, _id } } = req;
  const appDir = originalUrl.split("/")[1].split("?")[0];

  const model = (appDir === 'tags')
    ? compiledModels[collectionPrefix].Tag
    : compiledModels[collectionPrefix].Category;

  if ( slug || _id ) {
    const params = {};
    if (slug) params.slug = slug;
    else if (_id) params._id = _id;

    model.findOne(params)
      .populate({ path: 'ancestors' })
      .exec((err, doc) => {
        assert.ifError(err);
        res.json(doc);
      });
  } else {
    model.find()
      .populate({ path: 'ancestors' })
      .exec((err, docs) => {
        assert.ifError(err);
        res.json(docs);
      });
  }
});

router.post('/edit', authenticate, (req, res, next) => {
  const { currentUser, originalUrl } = req;
  const appDir = originalUrl.split("/").slice(-2, -1).toString();
  const { _id } = req.body;

  if ( !isUserCapable('manage', 'category', currentUser) )
    return res.sendStatus(403);

  const model = (appDir === 'tags')
    ? compiledModels[currentUser.collectionPrefix].Tag
    : compiledModels[currentUser.collectionPrefix].Category;

  model.findOne( { _id },
    (err, doc) => {
      assert.ifError(err);
      res.json(doc);
    }
  );
});

router.delete('/:_id?', authenticate, (req, res, next) => {
  const {
    originalUrl, currentUser,
    params: { _id }, query: { ids }
  } = req;
  const appDir = _id ? originalUrl.split("/").slice(-2, -1).toString() : originalUrl.split("/")[1].split("?")[0];

  if ( !isUserCapable('manage', 'category', currentUser) )
    return res.sendStatus(403);

  const model = (appDir === 'tags')
    ? compiledModels[currentUser.collectionPrefix].Tag
    : compiledModels[currentUser.collectionPrefix].Category;

  if (_id) { // single delete

    model.findOne({ _id })
    .exec((err, doc) => {
      assert.ifError(err);

      if (doc) {
        if (appDir === 'categories') {

          model.update(
            { parent: _id },
            { parent: null },
            { multi: true },
            err => {
              assert.ifError(err);

              model.find( { 'ancestors' : _id },
                (err, docs) => {
                  assert.ifError(err);

                  docs.forEach(doc =>
                    retrieveAncestors( model, doc.parent, doc, res, modified =>
                      modified.save(err => assert.ifError(err))
                    )
                  );
                }
              );

              compiledModels[currentUser.collectionPrefix].Post
              .find( { categories: _id },
                (err, docs) => {
                  assert.ifError(err);

                  docs.forEach(doc => {
                    const index = doc.categories.indexOf(_id);
                    if (index !== -1) {
                      doc.categories.splice(index, 1);
                      doc.save(err => assert.ifError(err));
                    }
                  });
                }
              );

              doc.remove();
              res.send(doc);
            }
          );
        } else { // if tags

          compiledModels[currentUser.collectionPrefix].Post
          .find( { tags: _id },
            (err, docs) => {
              assert.ifError(err);

              docs.forEach(doc => {
                const index = doc.tags.indexOf(_id);
                if (index !== -1) {
                  doc.tags.splice(index, 1);
                  doc.save(err => assert.ifError(err));
                }
              });
            }
          );

          doc.remove();
          res.send(doc);
        }

      } else {
        res.sendStatus(404);
      }
    });

  } else { // multiple delete

    model.remove( { _id: { $in: ids } },
      (err, response) => {
        assert.ifError(err);

        if (appDir === 'categories') {

          model.update(
            { parent: { $in: ids } },
            { parent: null },
            { multi: true },
            err => {
              assert.ifError(err);

              model.find( { 'ancestors' : { $in: ids } },
                (err, docs) => {
                  assert.ifError(err);

                  docs.forEach(doc =>
                    retrieveAncestors( model, doc.parent, doc, res,
                      modified => modified.save(err => assert.ifError(err))
                    )
                  );
                }
              );

              compiledModels[currentUser.collectionPrefix].Post
              .find( { categories: { $in: ids } },
                (err, docs) => {
                  assert.ifError(err);

                  docs.forEach(doc => {
                    doc.categories = doc.categories.filter( el => !ids.includes( el.toString() ) );
                    doc.save(err => assert.ifError(err));
                  });
                }
              );

            }
          );
        } else { // if tags

          compiledModels[currentUser.collectionPrefix].Post
          .find( { tags: { $in: ids } },
            (err, docs) => {
              assert.ifError(err);

              docs.forEach(doc => {
                doc.tags = doc.tags.filter( el => !ids.includes( el.toString() ) );
                doc.save(err => assert.ifError(err));
              });
            }
          );

        }
        res.send(response);
      }
    );

  }
});

module.exports = router;
