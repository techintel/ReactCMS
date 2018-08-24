import axios from 'axios';
import { SERVER_ROOT_URL } from '../config';

import {
  FETCH_SITE,
  SWITCH_THEME,
  EDIT_THEME_OPTION,
  MOVE_WIDGET,
  MANAGE_OPTIONS,
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

export function saveWidget(area, values, onSave) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/widgets/save`, { area, values })
    .then(res => {
      onSave();
      return res;
    });

  return {
    type: EDIT_THEME_OPTION,
    payload: request
  };
}

export function saveMovedWidget(area, values, onSave) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/widgets/move`, { area, values })
    .then(res => {
      onSave();
      return res;
    });

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

export function configureSettings(optionName, config, onConfigure) {
  const request = axios.post(`${SERVER_ROOT_URL}/sites/settings/${optionName}`, config)
    .then(res => {
      if ( onConfigure ) onConfigure(res.data);
      return res;
    });

  return {
    type: MANAGE_OPTIONS,
    payload: request
  };
}
