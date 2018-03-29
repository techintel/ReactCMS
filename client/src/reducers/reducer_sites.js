import {
  FETCH_SITE
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_SITE:
      return { ...state, [action.payload.data._id.domain]: action.payload.data };
    default:
      return state;
  }
}
