import _ from 'lodash';

import {
  FETCH_PAGES,
  DELETE_PAGE, DELETE_PAGES,
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;
  const { data } = payload ? payload : { data: null };

  switch (action.type) {
    case FETCH_PAGES:
      const mapped = _.mapKeys(data, '_id');
      return { ...state, ...mapped };

    case DELETE_PAGE:
      return (data.status === 'delete') ?
        _.omit(state, data._id) :
        { ...state, [data._id]: data };

    case DELETE_PAGES:
      const { params: { ids } } = payload.config;

      return (data.status === 'delete') ?
        _.omit(state, ids) :
        _.mapValues( state, o => {
          if ( ids.includes( o._id ) ) o.status = 'trash';
          return o;
        });

    default:
      return state;
  }
}
