const mongoose = require('mongoose');
const assert = require('assert');
const { authorFieldRef, tagsFieldRef, ancestorsFieldRef } = require('../utils');

const { siteSchema } = require('./schemas');
const Site = mongoose.model('Site', siteSchema);
const compiledModels = [];

Site.find( {},
  (err, docs) => {
    assert.ifError(err);

    docs.forEach( doc => {
      const { userSchema, unverifiedSchema, tagSchema, postSchema } = require('./schemas');
      const categorySchema = tagSchema.clone();
      const blogSchema = postSchema.clone();
      const pageSchema = postSchema.clone();

      const { _id: { collectionPrefix } } = doc;
      const userRef = `${collectionPrefix}User`;
      const categoryRef = `${collectionPrefix}Category`;
      const pageRef = `${collectionPrefix}Page`;

      categorySchema.add(ancestorsFieldRef(categoryRef));
      blogSchema.add(authorFieldRef(userRef));
      blogSchema.add(tagsFieldRef(collectionPrefix));
      pageSchema.add(authorFieldRef(userRef));
      pageSchema.add(ancestorsFieldRef(pageRef));

      const User = mongoose.model(userRef, userSchema);
      const Unverified = mongoose.model( `${collectionPrefix}Unverified`, unverifiedSchema,
        `${collectionPrefix}unverified` // collection name
      );
      const Category = mongoose.model( categoryRef, categorySchema,
        `${collectionPrefix}categories` // collection name
      );
      const Tag = mongoose.model(`${collectionPrefix}Tag`, tagSchema);
      const Post = mongoose.model(`${collectionPrefix}Post`, blogSchema);
      const Page = mongoose.model(pageRef, pageSchema);

      compiledModels[collectionPrefix] = { User, Unverified, Category, Tag, Post, Page };
    });
  }
);

module.exports = { Site, compiledModels };
