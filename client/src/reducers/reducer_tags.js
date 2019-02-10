import _ from 'lodash';

import {
  FETCH_TAGS,
  DELETE_TAG, DELETE_TAGS,
  ADD_TAG, FETCH_TAG,
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;
  const { data } = payload ? payload : { data: null };
  let mapped;

  switch (action.type) {
    case FETCH_TAGS:
      mapped = _.mapKeys(data, '_id');
      return { ...state, ...mapped };

    case DELETE_TAG:
      return _.omit(state, data._id);

    case DELETE_TAGS:
      const { params: { ids } } = payload.config;
      return _.omit(state, ids);

    case ADD_TAG:
    case FETCH_TAG:
      return { ...state, [data._id]: data };

    default:
      return state;
  }
}
