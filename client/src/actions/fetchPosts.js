import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';

import {
  FETCH_CATEGORY, FETCH_CATEGORIES, DELETE_CATEGORY, DELETE_CATEGORIES, ADD_CATEGORY,
  FETCH_TAG, FETCH_TAGS, DELETE_TAG, DELETE_TAGS, ADD_TAG,
  FETCH_POST, FETCH_POSTS, DELETE_POST, DELETE_POSTS, ADD_POST,
  FETCH_PAGE, FETCH_PAGES, DELETE_PAGE, DELETE_PAGES, ADD_PAGE,
} from './types';

export function fetchPosts(type, params, onFetch) {
  const request = axios.get(
    `${SERVER_ROOT_URL}/${type === 'category' ? 'categorie' : type}s`,
    { params }
  ).then( res => {
    if ( onFetch ) onFetch(res.data);
    return res;
  });

  switch (type) {
    case 'category':
      type = FETCH_CATEGORIES;
      break;
    case 'tag':
      type = FETCH_TAGS;
      break;
    case 'post':
      type = FETCH_POSTS;
      break;
    case 'page':
      type = FETCH_PAGES;
      break;
    default: break;
  }
  return { type, payload: request };
}

export function fetchPost(type, params, onFetch) {
  const request = axios.get(
    `${SERVER_ROOT_URL}/${type === 'category' ? 'categorie' : type}s`,
    { params }
  )
  .then( res => {
    if ( onFetch ) onFetch(res.data);
    return res;
  })
  .catch( err => {
    if ( onFetch ) onFetch(false);
  });

  switch (type) {
    case 'category':
      type = FETCH_CATEGORY;
      break;
    case 'tag':
        type = FETCH_TAG;
        break;
    case 'post':
      type = FETCH_POST;
      break;
    case 'page':
      type = FETCH_PAGE;
      break;
    default: break;
  }
  return { type, payload: request };
}

export function deletePost(type, id, onDelete) {
  const request = axios.delete(`${SERVER_ROOT_URL}/${type === 'category' ? 'categorie' : type}s/${id}`)
  .then( res => {
    if ( onDelete ) onDelete(res.data);
    return res;
  });

  switch (type) {
    case 'category':
      type = DELETE_CATEGORY;
      break;
    case 'tag':
        type = DELETE_TAG;
        break;
    case 'post':
      type = DELETE_POST;
      break;
    case 'page':
      type = DELETE_PAGE;
      break;
    default: break;
  }
  return { type, payload: request };
}

export function deletePosts(type, ids, onDelete) {
  const request = axios.delete(
    `${SERVER_ROOT_URL}/${type === 'category' ? 'categorie' : type}s`,
    { params: { ids } }
  )
  .then( res => {
    if ( onDelete ) onDelete(res.data);
    return res;
  });

  switch (type) {
    case 'category':
      type = DELETE_CATEGORIES;
      break;
    case 'tag':
        type = DELETE_TAGS;
        break;
    case 'post':
      type = DELETE_POSTS;
      break;
    case 'page':
      type = DELETE_PAGES;
      break;
    default: break;
  }
  return { type, payload: request };
}

export function addStateValues(type, values) {
  switch (type) {
    case 'category':
      type = ADD_CATEGORY;
      break;
    case 'tag':
        type = ADD_TAG;
        break;
    case 'post':
      type = ADD_POST;
      break;
    case 'page':
      type = ADD_PAGE;
      break;
    default: break;
  }
  return { type, payload: values };
}
