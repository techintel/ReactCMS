const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { isEmpty } = require('lodash');
const { isUserCapable } = require('../utils/reactcms');
const { populateSort, tagsCount } = require('../utils');

const { compiledModels } = require('../models');
const assert = require('assert');

router.post('/add', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { _id, title, slug, content, status, categories, tags } = req.body;
  const errors = {};

  if ( status === 'publish' && !isUserCapable('publish', 'post', currentUser) )
    return res.sendStatus(403);

  if ( !title )
    errors.title = 'Please enter some title.';
  if ( !slug || /[^\w-]+/g.test(slug) || /[A-Z]/.test(slug) )
    errors.slug = 'Must only contain dash, underscore and lowercase alphanumeric characters.';
  if ( !isEmpty(errors) )
    return res.status(401).json({ errors });

  if ( _id === undefined ) { // New post

    const date = new Date();
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    compiledModels[currentUser.collectionPrefix].Post
    .aggregate([
      { $project: {
        slug: 1,
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" }
      } },
      { $match: {
        slug, year, month, day
      } }
    ], (err, docs) => {
      assert.ifError(err);

      if (docs.length === 0) {
        compiledModels[currentUser.collectionPrefix].Post
        .create({
          author: currentUser._id,
          title, slug, content, status, categories, tags
        }, (err, doc) => {
          assert.ifError(err);

          tagsCount(compiledModels[currentUser.collectionPrefix]);
          populateSort( doc, null, doc => res.status(201).json(doc) );
        });
      } else {
        errors.slug = 'Duplicate slug on the same day.';
        res.status(409).json({ errors });
      }
    });

  } else { // Modify post

    compiledModels[currentUser.collectionPrefix].Post
    .findOne( { _id },
      (err, doc) => {
        assert.ifError(err);

        if (doc) {
          if ( isUserCapable( 'edit', 'post', currentUser, doc ) ) {
            doc.title = title;
            doc.content = content;
            doc.status = status;
            doc.modified = Date.now();
            doc.categories = categories;
            doc.tags = tags;

            if (doc.slug === slug) {
              doc.save(err => {
                assert.ifError(err);

                tagsCount(compiledModels[currentUser.collectionPrefix]);
                populateSort( doc, null, doc => res.json(doc) );
              });

            } else { // If slug is modified.

              const date = new Date(doc.date);
              const year = date.getUTCFullYear()
              const month = date.getUTCMonth() + 1;
              const day = date.getUTCDate();

              compiledModels[currentUser.collectionPrefix].Post
              .aggregate([
                { $project: {
                  slug: 1,
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" }
                } },
                { $match: {
                  slug, year, month, day
                } }
              ], (err, docs) => {
                assert.ifError(err);

                if (docs.length === 0) {
                  doc.slug = slug;

                  doc.save(err => {
                    assert.ifError(err);

                    tagsCount(compiledModels[currentUser.collectionPrefix]);
                    populateSort( doc, null, doc => res.json(doc) );
                  });
                } else {
                  errors.slug = 'Duplicate slug on the same day.';
                  res.status(409).json({ errors });
                }
              });

            }
          } else {
            res.sendStatus(403);
          }
        } else {
          res.sendStatus(404);
        }

      }
    );

  }
});

router.get('/', authenticate, (req, res, next) => {
  const { currentUser, query: {
    collectionPrefix, status, limit, skip, categories, tags,
    slug, year, month, day,
    _id,
  } } = req;

  if ( slug && year && month && day ) {
    compiledModels[collectionPrefix].Post.aggregate([
      { $project: {
        slug: 1,
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" }
      } },
      { $match: {
        slug,
        year: Number(year),
        month: Number(month),
        day: Number(day)
      } }
    ], (err, docs) => {
      assert.ifError(err);

      if ( docs.length > 0 ) {
        populateSort(
          compiledModels[collectionPrefix].Post.findOne({ _id: docs[0]._id }),
          null, doc => {
            if ( doc.status === 'publish' ) {
              res.json(doc);
            } else {
              if ( isUserCapable( 'edit', 'post', currentUser, doc ) )
                res.json(doc);
              else
                res.sendStatus(404);
            }
          }
        );
      } else {
        res.sendStatus(404);
      }
    });

  } else if ( _id ) {
    populateSort(
      compiledModels[collectionPrefix].Post.findOne({ _id }),
      null, doc => {
        if ( doc.status === 'publish' ) {
          res.json(doc);
        } else {
          if ( isUserCapable( 'edit', 'post', currentUser, doc ) )
            res.json(doc);
          else
            res.sendStatus(404);
        }
      }
    );

  } else {
    const q = {};
    if ( status ) q.status = status;
    if ( categories ) q.categories = categories;
    if ( tags ) q.tags = tags;

    populateSort(
      compiledModels[collectionPrefix].Post.find(q),
      { date: -1 }, docs => res.json(docs),
      { limit, skip }
    );
  }
});

router.post('/edit', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { _id } = req.body;

  populateSort(
    compiledModels[currentUser.collectionPrefix].Post.findOne({ _id }),
    null, doc => {
      if (doc) {
        if ( isUserCapable( 'edit', 'post', currentUser, doc ) )
          res.json(doc);
        else
          res.sendStatus(403);
      } else {
        res.sendStatus(404);
      }
    }
  );
});

router.delete('/:_id?', authenticate, (req, res, next) => {
  const { currentUser,
    params: { _id }, query: { ids }
  } = req;

  if (_id) { // single delete

    populateSort(
      compiledModels[currentUser.collectionPrefix].Post.findOne({ _id }),
      null, doc => {
        if (doc) {
          if ( isUserCapable( 'delete', 'post', currentUser, doc ) ) {
            if (doc.status !== 'trash') {
              doc.status = 'trash';
              doc.save(err => {
                assert.ifError(err);
                res.send(doc);
              });
            } else {
              doc.status = 'delete';
              doc.remove();

              tagsCount(compiledModels[currentUser.collectionPrefix]);
              res.send(doc);
            }
          } else {
            res.sendStatus(403);
          }
        } else {
          res.sendStatus(404);
        }
      }
    );

  } else { // multiple delete

    populateSort(
      compiledModels[currentUser.collectionPrefix].Post.find({ _id: { $in: ids } }),
      null, docs => {
        let nextStatus;

        docs.forEach( doc => {
          if ( isUserCapable( 'delete', 'post', currentUser, doc ) ) {
            if (doc.status !== 'trash') {
              doc.status = 'trash';
              doc.save(err => assert.ifError(err));
            } else {
              doc.status = 'delete';
              doc.remove();

              tagsCount(compiledModels[currentUser.collectionPrefix]);
            }

            if (!nextStatus) nextStatus = doc.status;
          }
        });

        res.send({
          n: docs.length,
          status: nextStatus
        });
      }
    );

  }
});

module.exports = router;
