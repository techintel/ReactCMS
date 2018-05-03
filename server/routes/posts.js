const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { havePermission, authorFieldRef } = require('../utils');
const { isEmpty } = require('lodash');

const mongoose = require('mongoose');
const { postSchema, userSchema } = require('../models/schemas');
const assert = require('assert');
const compiledModels = [];

const {
  PUBLISH_POSTS,
  EDIT_OTHERS_POSTS,
  DELETE_OTHERS_POSTS,
  DELETE_PUBLISHED_POSTS
} = require('./capabilities');

router.post('/publish', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const errors = {};

  if ( !havePermission(currentUser, PUBLISH_POSTS, res) ) {
    errors._error = "You don't have permission";
    return res.status(403).json({ errors });
  }

  const { title, slug, content, categories, status, _id } = req.body;

  if (
    !slug ||
    /[^\w-]+/g.test(slug) ||
    /[A-Z]/.test(slug)
  ) {
    errors.slug = 'Must only contain dash, underscore and lowercase alphanumeric characters.';
  }
  if ( !isEmpty(errors) ) {
    return res.status(401).json({ errors });
  }

  if ( !(currentUser.collectionPrefix in compiledModels) ) {
    postSchema.add(authorFieldRef(`${currentUser.collectionPrefix}User`));

    const Post = mongoose.model(`${currentUser.collectionPrefix}Post`, postSchema);
    compiledModels[currentUser.collectionPrefix] = { Post };
  }

  const dateObj = new Date();
  const year = dateObj.getUTCFullYear()
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  if (_id === undefined) {
    // New post

    compiledModels[currentUser.collectionPrefix].Post.aggregate([
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

        compiledModels[currentUser.collectionPrefix].Post.create(
          {
            author: currentUser._id,
            title, slug, content, categories, status
          },
          (err, doc) => {
            assert.ifError(err);

            res.status(201).json(doc);
          }
        );

      } else {
        errors.slug = 'Duplicate slug on the same day.';
        res.status(409).json({ errors });
      }

    });

  } else {
    // Edit post

    const query = { _id };

    if ( !havePermission(currentUser, EDIT_OTHERS_POSTS, res) ) {
      query.author = currentUser._id;
    }

    compiledModels[currentUser.collectionPrefix].Post.updateOne(
      query,
      { title, slug, content, categories, status },
      (err, doc) => {
        assert.ifError(err);

        res.json(doc);
      }
    );

  }
});

router.get('/', (req, res, next) => {
  const { query } = req;
  const userRef = `${query.collectionPrefix}User`;

  // Modify `postSchema` author to be used for `compiledModels`.
  postSchema.add(authorFieldRef(userRef));

  if ( !(query.collectionPrefix in compiledModels) ) {
    const Post = mongoose.model(`${query.collectionPrefix}Post`, postSchema);
    mongoose.model(userRef, userSchema);

    compiledModels[query.collectionPrefix] = { Post };
  }

  const { slug, year, month, day } = query;

  if ( slug && year && month && day ) {

    compiledModels[query.collectionPrefix].Post.aggregate([
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

      if (docs.length > 0) {

        compiledModels[query.collectionPrefix].Post
        .findOne({ _id: docs[0]._id })
        .populate({
          path: 'author',
          select: '-hash -email'
        })
        .exec((err, doc) => {
            assert.ifError(err);

            res.json(doc);
        });

      } else {
        res.send(404);
      }

    });

  } else {
    const findQuery = {};
    if ( query.status ) {
      findQuery.status = query.status;
    }

    compiledModels[query.collectionPrefix].Post
    .find(findQuery)
    .populate({
      path: 'author',
      select: '-hash -email'
    })
    .sort('-date')
    .exec((err, posts) => {
      assert.ifError(err);

      res.json(posts);
    });
  }
});

router.post('/edit', authenticate, (req, res, next) => {
  const { currentUser } = req;

  if ( !(currentUser.collectionPrefix in compiledModels) ) {
    postSchema.add(authorFieldRef(`${currentUser.collectionPrefix}User`));

    const Post = mongoose.model(`${currentUser.collectionPrefix}Post`, postSchema);
    compiledModels[currentUser.collectionPrefix] = { Post };
  }

  const { _id } = req.body;
  const query = { _id };

  if ( !havePermission(currentUser, EDIT_OTHERS_POSTS, res) ) {
    query.author = currentUser._id;
  }

  compiledModels[currentUser.collectionPrefix].Post.findOne(
    query,
    (err, doc) => {
      assert.ifError(err);

      if (doc) {
        res.send(doc);
      } else {
        res.send(404);
      }
    }
  );
});

router.delete('/:_id', authenticate, (req, res, next) => {
  const { currentUser } = req;

  if ( !(currentUser.collectionPrefix in compiledModels) ) {
    postSchema.add(authorFieldRef(`${currentUser.collectionPrefix}User`));

    const Post = mongoose.model(`${currentUser.collectionPrefix}Post`, postSchema);
    compiledModels[currentUser.collectionPrefix] = { Post };
  }

  const { _id } = req.params;
  const query = { _id };

  if ( !havePermission(currentUser, DELETE_OTHERS_POSTS, res) ) {
    if ( havePermission(currentUser, DELETE_PUBLISHED_POSTS, res) ) {
      query.author = currentUser._id;
    } else {
      return res.status(403).json({
        errors: {
          _error: "You don't have permission"
        }
      });
    }
  }

  compiledModels[currentUser.collectionPrefix].Post.findOneAndRemove(
    query,
    (err, doc) => {
      assert.ifError(err);

      res.send(doc);
  });
});

module.exports = router;
