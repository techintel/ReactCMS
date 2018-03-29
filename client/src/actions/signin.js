import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';
import { SubmissionError } from 'redux-form';
import { setAuthorizationToken } from '../utils';
import jwt_decode from 'jwt-decode';

import {
  SET_CURRENT_USER
} from './types';

const signinWithEmail = (formData, callback) => {
  const request = axios.post(`${SERVER_ROOT_URL}/users`, formData)
  .then(res => callback(res.data))
  .catch(err => {
    const { data: { errors } } = err.response;

    throw new SubmissionError({
      ...errors
    });
  });

  return request;
}

const signinAsyncValidate = (values /*, dispatch */) => {
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

const setCurrentUserByToken = (domain, token) => {
  setAuthorizationToken(token);

  const user = (token !== false) ? jwt_decode(token) : {};
  return {
    type: SET_CURRENT_USER,
    user
  };
}

export {
  signinWithEmail,
  signinAsyncValidate,
  setCurrentUserByToken
};
