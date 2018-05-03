import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';

import {
  FETCH_POSTS,
  FETCH_POST,
  DELETE_POST
} from './types';

export function fetchPosts(collectionPrefix, status) {
  const request = axios.get(
    `${SERVER_ROOT_URL}/posts`,
    { params: {
      collectionPrefix, status
    } }
  );

  return {
    type: FETCH_POSTS,
    payload: request
  };
}

export function fetchPost({ collectionPrefix, slug, year, month, day }, onFetch) {
  const request = axios.get(
    `${SERVER_ROOT_URL}/posts`,
    { params: {
      collectionPrefix, slug, year, month, day
    } }
  )
  .then(res => {
    onFetch(res.data);
    return res;
  })
  .catch(err => onFetch(false));

  return {
    type: FETCH_POST,
    payload: request
  }
}

export function deletePost(_id, onDelete) {
  axios.delete(`${SERVER_ROOT_URL}/posts/${_id}`)
  .then(() => {
    if ( onDelete ) onDelete();
  });

  return {
    type: DELETE_POST,
    payload: _id
  }
}
