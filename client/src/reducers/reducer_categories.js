import _ from 'lodash';

import {
  FETCH_CATEGORIES,
  DELETE_CATEGORY,
  DELETE_CATEGORIES,
  ADD_CATEGORY,
  FETCH_CATEGORY
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;
  const { data } = payload ? payload : { data: null };
  let mapped;

  switch (action.type) {
    case FETCH_CATEGORY:
      return data ? { ...state, [data._id]: data } : state;

    case FETCH_CATEGORIES:
      mapped = _.mapKeys(data, '_id');
      return { ...state, ...mapped };

    case DELETE_CATEGORY:
      return _.omit(state, data._id);

    case DELETE_CATEGORIES:
      const {
        params: { ids }
      } = payload.config;
      return _.omit(state, ids);

    case ADD_CATEGORY:
      return { ...state, [data._id]: data };

    default:
      return state;
  }
};
