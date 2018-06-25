const { Schema } = require('mongoose');

const siteSchema = new Schema({
  _id: {
    domain: { type: String, required: true },
    collectionPrefix: { type: String, required: true },
  },
  title: String,
  description: String,
  front_page: {
    show_on_front: { type: String, default: 'posts' },
    page_on_front: Schema.ObjectId,
    page_for_posts: Schema.ObjectId,
  },
});

const userSchema = new Schema({
  email: String,
  username: String,
  hash: String,
  role: { type: String, default: 'subscriber' },
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
});

const unverifiedSchema = new Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expires: { type: Date, required: true },
});

const tagSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  count: { type: Number, default: 0 },
});

const postSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, default: 'publish' },

  date: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
});

module.exports = {
  siteSchema,
  userSchema,
  unverifiedSchema,
  tagSchema,
  postSchema,
};
