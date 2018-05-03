import {
  FETCH_SITE
} from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_SITE:
      const _id = action.payload.data._id;
      return {
        domain: _id.domain,
        collectionPrefix: _id.collectionPrefix
      };
    default:
      return state;
  }
}
