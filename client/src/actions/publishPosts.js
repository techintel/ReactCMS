import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';
import { SubmissionError } from 'redux-form';

export function publishPost(formData, onPublish) {
  const request = axios.post(`${SERVER_ROOT_URL}/posts/publish`, formData)
  .then(res => onPublish(true))
  .catch(err => {
    const { data: { errors } } = err.response;

    onPublish(false);
    throw new SubmissionError(errors);
  });

  return request;
}

export function editPost(_id, onEdit) {
  const request = axios.post(`${SERVER_ROOT_URL}/posts/edit`, { _id })
  .then(res => onEdit(res.data))
  .catch(err => {
    console.log(err);
  });

  return request;
}
