import {
  OPEN_SNACKBAR, CLOSE_SNACKBAR
} from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case OPEN_SNACKBAR:
      const { payload } = action;
      return { ...state, ...payload, open: true };

    case CLOSE_SNACKBAR:
      return { ...state, open: false };

    default:
      return state;
  }
}
