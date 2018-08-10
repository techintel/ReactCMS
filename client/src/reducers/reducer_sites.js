import { orderBy } from 'lodash';

import {
  FETCH_SITE,
  SWITCH_THEME,
  EDIT_THEME_OPTION,
  MOVE_WIDGET,
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;

  switch (action.type) {
    case FETCH_SITE:
      return { ...state, [payload.data._id.domain]: payload.data };
    case SWITCH_THEME:
      return { ...state, [payload.data._id.domain]: payload.data };
    case EDIT_THEME_OPTION:
      return { ...state, [payload.data._id.domain]: payload.data };
    case MOVE_WIDGET:
      const stateDeepCopy = JSON.parse(JSON.stringify(state));
      const { drag, hover } = payload;

      const areaKeys = ['content', 'left_sidebar', 'right_sidebar', 'footer'];
      areaKeys.forEach(areaKey => {
        let areaItems = stateDeepCopy[drag.domain][areaKey];
        const dragIndex = areaItems.findIndex(el => el._id === drag.data._id);

        if (dragIndex !== -1) {
          areaItems.splice(dragIndex, 1);
          areaItems = orderBy(areaItems, 'order');
          areaItems.forEach((o, i, a) => {
            o.order = i + 1;
            a[i] = o;
          });
        }
      });

      let hoverArea = stateDeepCopy[hover.domain][hover.area];
      hoverArea.forEach((o, i, a) => {
        if (o.order >= hover.data.order) {
          o.order = o.order + 1;
          a[i] = o;
        }
      });
      hoverArea.push({ ...drag.data, order: hover.data.order });

      stateDeepCopy[hover.domain][hover.area] = hoverArea;
      return stateDeepCopy;

    default:
      return state;
  }
}
