import _ from 'lodash';

import {
  FETCH_POST,
  FETCH_POSTS,
  DELETE_POST,
  DELETE_POSTS
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;
  const { data } = payload ? payload : { data: null };

  switch (action.type) {
    case FETCH_POST:
      return payload ? { ...state, [data._id]: data } : state;

    case FETCH_POSTS:
      const mapped = _.mapKeys(data, '_id');
      const uniquePost = _.find(mapped, o => !state[o._id]);
      return uniquePost ? { ...mapped, ...state } : { ...state, ...mapped };

    case DELETE_POST:
      return data.status === 'delete'
        ? _.omit(state, data._id)
        : { ...state, [data._id]: data };

    case DELETE_POSTS:
      const {
        params: { ids }
      } = payload.config;

      return data.status === 'delete'
        ? _.omit(state, ids)
        : _.mapValues(state, o => {
            if (ids.includes(o._id)) o.status = 'trash';
            return o;
          });

    default:
      return state;
  }
};
