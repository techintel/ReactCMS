import { includes } from 'lodash';
import { slashDomain, POST_STATUSES } from './';

import {
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
  SWITCH_THEMES,
  EDIT_THEMES,
  EDIT_THEME_OPTIONS,
  MANAGE_OPTIONS
} from '../containers/capabilities';

function isCapable(
  user,
  post,
  capability,
  capability_others,
  capability_published
) {
  if (post) {
    if (post.author._id === user.id) {
      return post.status === 'publish'
        ? includes(capability_published, user.role)
        : includes(capability, user.role);
    } else {
      return includes(capability_others, user.role);
    }
  } else {
    return includes(capability, user.role);
  }
}

export function isUserCapable(action, postType, user, post) {
  switch (`${action}_${postType}`) {
    case 'manage_category':
      return isCapable(user, null, MANAGE_CATEGORIES);

    case 'publish_post':
      return isCapable(user, null, PUBLISH_POSTS);
    case 'edit_post':
      return isCapable(
        user,
        post,
        EDIT_POSTS,
        EDIT_OTHERS_POSTS,
        EDIT_PUBLISHED_POSTS
      );
    case 'delete_post':
      return isCapable(
        user,
        post,
        DELETE_POSTS,
        DELETE_OTHERS_POSTS,
        DELETE_PUBLISHED_POSTS
      );

    case 'publish_page':
      return isCapable(user, null, PUBLISH_PAGES);
    case 'edit_page':
      return isCapable(
        user,
        post,
        EDIT_PAGES,
        EDIT_OTHERS_PAGES,
        EDIT_PUBLISHED_PAGES
      );
    case 'delete_page':
      return isCapable(
        user,
        post,
        DELETE_PAGES,
        DELETE_OTHERS_PAGES,
        DELETE_PUBLISHED_PAGES
      );

    case 'switch_theme':
      return isCapable(user, null, SWITCH_THEMES);
    case 'edit_theme':
      return isCapable(user, null, EDIT_THEMES);
    case 'edit_theme_option':
      return isCapable(user, null, EDIT_THEME_OPTIONS);

    case 'manage_option':
      return isCapable(user, null, MANAGE_OPTIONS);

    default:
      return;
  }
}

export function onEditPost(type, _id, domain, history) {
  history.push(
    `${slashDomain(domain)}/admin/${
      type !== 'page' ? 'posts' : 'pages'
    }/${type}/${_id}`
  );
}

export function onViewPost(type, post, domain, history) {
  let Uri = `${slashDomain(domain)}/`;

  if (type === 'post') {
    const date = new Date(post.date);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    Uri += `blog/${year}/${month}/${day}/`;
  }

  if (type === 'category') Uri += `blog/category/`;
  if (type === 'tag') Uri += `blog/tag/`;

  Uri += post.slug;
  history.push(Uri);

  const content = document.getElementById('content');
  if (content) {
    let topPos = content.offsetTop;

    const header = document.getElementById('header');
    if (header) topPos -= header.offsetHeight;

    window.scrollTo({
      top: topPos,
      behavior: 'smooth'
    });
  }
}

export function getPostStatuses(type, user, post) {
  let filtered = POST_STATUSES;

  if (!isUserCapable('publish', type, user, post))
    filtered = filtered.filter(o => o.value !== 'publish');
  if (!isUserCapable('edit', type, user, post))
    filtered = filtered.filter(o => o.value !== 'draft');
  if (!isUserCapable('delete', type, user, post))
    filtered = filtered.filter(o => o.value !== 'trash');

  return filtered;
}
