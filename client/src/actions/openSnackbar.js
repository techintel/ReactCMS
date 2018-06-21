import {
  OPEN_SNACKBAR, CLOSE_SNACKBAR
} from './types';

export function openSnackbar(message, variant = 'info') {
  const request = { message, variant };

  return {
    type: message ? OPEN_SNACKBAR : CLOSE_SNACKBAR,
    payload: request
  }
}
