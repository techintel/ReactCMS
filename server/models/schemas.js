const { Schema } = require('mongoose');

const widgetAreaField = {
  type: [{
    _id: { type: Schema.ObjectId, required: true },
    type: { type: String, required: true },
    order: { type: Number, required: true },
    title: Schema.Types.Mixed,
    body: Schema.Types.Mixed,
  }],
  default: [],
};

const siteSchema = new Schema({
  _id: {
    domain: { type: String },
    collectionPrefix: { type: String },
  },
  title: String,
  description: String,
  front_page: {
    show_on_front: { type: String, default: 'posts' },
    page_on_front: Schema.ObjectId,
    page_for_posts: Schema.ObjectId,
  },
  template: { type: String, default: 'light' },
  themes: {
    type: Array,
    'default': [
      { template: 'light', name: 'Light', author: 'ReactCMS' },
      { template: 'dark', name: 'Dark', author: 'ReactCMS' },
    ],
  },
  content: widgetAreaField,
  left_sidebar: widgetAreaField,
  right_sidebar: widgetAreaField,
  footer: widgetAreaField,
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
