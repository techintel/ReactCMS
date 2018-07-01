const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { isEmpty } = require('lodash');
const { retrieveAncestors } = require('../utils');
const { isUserCapable } = require('../utils/reactcms');

const { compiledModels } = require('../models');
const assert = require('assert');

router.post('/add', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { _id, title, slug, content, status, parent } = req.body;
  const errors = {};

  if ( status === 'publish' && !isUserCapable('publish', 'page', currentUser) )
    return res.sendStatus(403);

  if ( !title )
    errors.title = 'Please enter some title.';
  if ( !slug || /[^\w-]+/g.test(slug) || /[A-Z]/.test(slug) )
    errors.slug = 'Must only contain dash, underscore and lowercase alphanumeric characters.';
  if ( !isEmpty(errors) )
    return res.status(401).json({ errors });

  if ( _id === undefined ) { // New post

    compiledModels[currentUser.collectionPrefix].Page
    .findOne( { slug },
      (err, duplicate) => {
        assert.ifError(err);

        if (!duplicate) {
          const newPost = {
            author: currentUser._id,
            title, slug, content, status
          };

          retrieveAncestors( compiledModels[currentUser.collectionPrefix].Page, parent, newPost, res, modified => {
            compiledModels[currentUser.collectionPrefix].Page
            .create( modified,
              (err, doc) => {
                assert.ifError(err);
                res.status(201).json(doc);
              }
            );
          });

        } else {
          errors.slug = 'Duplicate slug';
          res.status(409).json({ errors });
        }

      }
    );

  } else { // Modify post

    compiledModels[currentUser.collectionPrefix].Page
    .findOne( { _id },
      (err, editing) => {
        assert.ifError(err);

        if (editing) {
          if ( isUserCapable( 'edit', 'page', currentUser, editing ) ) {

            compiledModels[currentUser.collectionPrefix].Page
            .findOne( { slug },
              (err, duplicate) => {

                if (
                  ( editing.slug === slug && duplicate )
                  || ( editing.slug !== slug && !duplicate )
                ) {
                  editing.title = title;
                  editing.slug = slug;
                  editing.content = content;
                  editing.status = status;
                  editing.modified = Date.now();

                  retrieveAncestors( compiledModels[currentUser.collectionPrefix].Page, parent, editing, res, modified => {
                    modified.save(err => {
                      assert.ifError(err);
                      return res.json(modified);
                    });
                  });

                } else {
                  errors.slug = 'Duplicate slug';
                  res.status(409).json({ errors });
                }

              }
            );

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
  const { currentUser, query: { slug, collectionPrefix, status } } = req;

  if ( slug ) {
    compiledModels[collectionPrefix].Page
    .findOne( { slug } )
    .populate({
      path: 'author ancestors parent',
      select: '-hash -email'
    })
    .exec((err, doc) => {
      assert.ifError(err);

      if ( doc &&
        ( doc.status === 'publish' || isUserCapable( 'edit', 'page', currentUser, doc ) )
      ) return res.json(doc);

      res.sendStatus(404);
    });

  } else {
    const q = {};
    if ( status ) q.status = status;

    compiledModels[collectionPrefix].Page
    .find( q )
    .populate({
      path: 'author ancestors parent',
      select: '-hash -email'
    })
    .sort('-date')
    .exec((err, docs) => {
      assert.ifError(err);
      res.json(docs);
    });

  }
});

router.post('/edit', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { _id } = req.body;

  compiledModels[currentUser.collectionPrefix].Page
  .findOne( { _id },
    (err, doc) => {
      assert.ifError(err);

      if (doc) {
        if ( isUserCapable( 'edit', 'page', currentUser, doc ) ) {
          res.json(doc);
        } else {
          res.sendStatus(403);
        }
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

    compiledModels[currentUser.collectionPrefix].Page
    .findOne( { _id },
      (err, doc) => {
        assert.ifError(err);

        if (doc) {
          if ( isUserCapable( 'delete', 'page', currentUser, doc ) ) {
            if (doc.status !== 'trash') {
              doc.status = 'trash';
              doc.save(err => assert.ifError(err));
            } else {
              doc.status = 'delete';
              doc.remove();
            }

            res.send(doc);
          } else {
            res.sendStatus(403);
          }
        } else {
          res.sendStatus(404);
        }

      }
    );

  } else { // multiple delete

    compiledModels[currentUser.collectionPrefix].Page
    .find( { _id: { $in: ids } },
      (err, docs) => {
        assert.ifError(err);
        let nextStatus;

        docs.forEach(doc => {
          if ( isUserCapable( 'delete', 'page', currentUser, doc ) ) {
            if (doc.status !== 'trash') {
              doc.status = 'trash';
              doc.save(err => assert.ifError(err));
            } else {
              doc.status = 'delete';
              doc.remove();
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
