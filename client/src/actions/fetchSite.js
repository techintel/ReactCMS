import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';

import {
  FETCH_SITE,
  SWITCH_THEME,
  EDIT_THEME_OPTION,
  MOVE_WIDGET,
} from './types';

export function fetchSite(pathname) {
  let domain = pathname.split('/')[1];
  domain = domain.indexOf('.') !== -1 ? "" : domain;
  const request = axios.get(`${SERVER_ROOT_URL}/sites/${domain}`);

  return {
    type: FETCH_SITE,
    payload: request
  };
}

export function switchTheme(template) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/themes`, { template });

  return {
    type: SWITCH_THEME,
    payload: request
  };
}

export function saveWidget(area, values) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/widgets/save`, { area, values });

  return {
    type: EDIT_THEME_OPTION,
    payload: request
  };
}

export function saveMovedWidget(area, values) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/widgets/move`, { area, values });

  return {
    type: EDIT_THEME_OPTION,
    payload: request
  };
}

export function moveWidget(drag, hover) {
  return {
    type: MOVE_WIDGET,
    payload: { drag, hover }
  };
}

export function deleteWidget(area, values) {
  const request = axios.delete(`${SERVER_ROOT_URL}/sites/widgets`, { data: { area, values } });

  return {
    type: EDIT_THEME_OPTION,
    payload: request
  };
}
