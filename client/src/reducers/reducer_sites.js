import { orderBy } from 'lodash';

import {
  FETCH_SITE,
  SWITCH_THEME,
  EDIT_THEME_OPTION,
  MOVE_WIDGET,
  MANAGE_OPTIONS,
} from '../actions/types';

export default (state = {}, action) => {
  const { payload } = action;

  switch (action.type) {
    case FETCH_SITE: case SWITCH_THEME: case EDIT_THEME_OPTION: case MANAGE_OPTIONS:
      return { ...state, [payload.data._id.domain]: payload.data };

    case MOVE_WIDGET:
      const stateDeepClone = JSON.parse(JSON.stringify(state));
      const { drag, hover } = payload;

      const areaKeys = ['header', 'top_content', 'bottom_content', 'left_sidebar', 'right_sidebar', 'footer'];
      areaKeys.forEach(areaKey => {
        let areaItems = stateDeepClone[drag.domain][areaKey];
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

      let hoverArea = stateDeepClone[hover.domain][hover.area];
      hoverArea.forEach((o, i, a) => {
        if (o.order >= hover.data.order) {
          o.order = o.order + 1;
          a[i] = o;
        }
      });
      hoverArea.push({ ...drag.data, order: hover.data.order });

      stateDeepClone[hover.domain][hover.area] = hoverArea;
      return stateDeepClone;

    default:
      return state;
  }
}
