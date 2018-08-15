import React from 'react';
import PropTypes from 'prop-types';
import { renderTypography } from '../../utils';
import _ from 'lodash';

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
