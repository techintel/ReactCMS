import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';
import { SubmissionError } from 'redux-form';
import { setAuthorizationToken } from '../utils';
import jwt_decode from 'jwt-decode';

import {
  SET_CURRENT_USER
} from './types';

export function signinWithEmail(values, onSignin) {
  const request = axios.post(`${SERVER_ROOT_URL}/users`, values)
  .then(res => onSignin(res.data))
  .catch(err => {
    const { data: { errors } } = err.response;

    throw new SubmissionError(errors);
  });

  return request;
}

export function signinAsyncValidate(values /*, dispatch */) {
  return axios.post(`${SERVER_ROOT_URL}/users`, {
    ...values,
    validate: true
  })
  .then(res => {}) // No Error
  .catch(err => {
    const { data: { errors } } = err.response;

    throw errors;
  });
}

export function setCurrentUserByToken(domain, token) {
  setAuthorizationToken(token);

  const user = (token !== false) ? jwt_decode(token) : {};
  return {
    type: SET_CURRENT_USER,
    user
  };
}
