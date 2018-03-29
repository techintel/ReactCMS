import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';

import {
  FETCH_SITE,
} from './types';

export default function fetchSite(pathname) {
  let domain = pathname.split('/')[1];
  domain = domain.indexOf('.') !== -1 ? "" : domain;
  const request = axios.get(`${SERVER_ROOT_URL}/site/${domain}`);

  return {
    type: FETCH_SITE,
    payload: request
  };
}
