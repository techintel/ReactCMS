import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';
import { SubmissionError } from 'redux-form';

export function addCategory(formData, onAdd) {
  const request = axios.post(`${SERVER_ROOT_URL}/categories/add`, formData)
  .then(res => onAdd(res.data))
  .catch(err => {
    const { data: { errors } } = err.response;

    throw new SubmissionError(errors);
  });

  return request;
}
