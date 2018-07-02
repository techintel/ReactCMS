const { includes } = require('lodash');
const {
  MANAGE_CATEGORIES,

  PUBLISH_POSTS,
  EDIT_POSTS,
  EDIT_OTHERS_POSTS,
  EDIT_PUBLISHED_POSTS,

  DELETE_POSTS,
  DELETE_OTHERS_POSTS,
  DELETE_PUBLISHED_POSTS,

  PUBLISH_PAGES,
  EDIT_PAGES,
  EDIT_OTHERS_PAGES,
  EDIT_PUBLISHED_PAGES,

  DELETE_PAGES,
  DELETE_OTHERS_PAGES,
  DELETE_PUBLISHED_PAGES,
} = require('../routes/capabilities');

function isCapable(user, post, capability, capability_others, capability_published) {
  if ( user ) {
    if ( post ) {
      // post.author(._id) is typeof object while user.id is string.
      if ( post.author._id !== undefined ?
        post.author._id == user.id : post.author == user.id ) {
        return ( post.status === 'publish' ) ?
          includes(capability_published, user.role) :
          includes(capability, user.role);
      } else {
        return includes(capability_others, user.role);
      }
    } else {
      return includes(capability, user.role);
    }
  } else {
    return false;
  }
}

function isUserCapable(action, postType, user, post) {
  switch (`${action}_${postType}`) {
    case 'manage_category':
      return isCapable(user, null, MANAGE_CATEGORIES);

    case 'publish_post':
      return isCapable(user, null, PUBLISH_POSTS);
    case 'edit_post':
      return isCapable(user, post, EDIT_POSTS, EDIT_OTHERS_POSTS, EDIT_PUBLISHED_POSTS);
    case 'delete_post':
      return isCapable(user, post, DELETE_POSTS, DELETE_OTHERS_POSTS, DELETE_PUBLISHED_POSTS);

    case 'publish_page':
      return isCapable(user, null, PUBLISH_PAGES);
    case 'edit_page':
      return isCapable(user, post, EDIT_PAGES, EDIT_OTHERS_PAGES, EDIT_PUBLISHED_PAGES);
    case 'delete_page':
      return isCapable(user, post, DELETE_PAGES, DELETE_OTHERS_PAGES, DELETE_PUBLISHED_PAGES);

    default:
      return;
  }
}

module.exports = {
  isUserCapable
};
