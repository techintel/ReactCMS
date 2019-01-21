import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { renderTypography } from '../../utils';
import { RenderMenu } from '../../containers/Admin/Appearance/Widgets/Menu/';

function RenderWidgets({ contents }) {
  return (
    <div>
      {_.map(_.orderBy(contents, 'order'),
        widget => {
          switch (widget.type) {

            case 'markdown':
              return renderTypography(widget, true);
            case 'html':
              return renderTypography(widget);

            case 'menu':
              return <RenderMenu widget={widget} key={widget.order} />;

            default:
              return;
          }
        }
      )}
    </div>
  );
}

RenderWidgets.propTypes = {
  contents: PropTypes.array.isRequired,
};

export default RenderWidgets;
