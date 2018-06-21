import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';
import { SubmissionError } from 'redux-form';

export function addPost(type, values, onAdd) {
  if (type === 'category') type = 'categorie';

  const request = axios.post(`${SERVER_ROOT_URL}/${type}s/add`, values)
  .then(res => onAdd(res))
  .catch(err => {
    const { data: { errors } } = err.response;

    onAdd(false);
    throw new SubmissionError(errors);
  });

  return request;
}

export function editPost(type, _id, onEdit) {
  if (type === 'category') type = 'categorie';

  const request = axios.post(`${SERVER_ROOT_URL}/${type}s/edit`, { _id })
  .then(res => onEdit(res.data))
  .catch(err => console.log(err));

  return request;
}
