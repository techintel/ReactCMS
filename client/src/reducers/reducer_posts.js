import _ from 'lodash';

import {
  FETCH_POSTS,
  FETCH_POST,
  DELETE_POST
} from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return {
        ...state,
        ..._.mapKeys(action.payload.data, '_id')
      };
    case FETCH_POST:
      return (action.payload !== undefined) ?
        { ...state, [action.payload.data._id]: action.payload.data } :
        state;
    case DELETE_POST:
      return _.omit(state, action.payload);
    default:
      return state;
  }
}
