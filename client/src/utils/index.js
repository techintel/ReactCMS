import React from 'react';
import _ from 'lodash';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { Typography } from 'material-ui';

import axios from 'axios';

const createCleanHtml = (dirtyMarkupSource, markdownFormatted) => {
  const cleanHtml = DOMPurify.sanitize(
    markdownFormatted ? marked(dirtyMarkupSource) : dirtyMarkupSource
  );
  return {__html: cleanHtml};
}

const renderTypography = ({ type, order, title, body, ...custom }, markdownFormatted) => {
  const { ...titleCustom } = title;
  const titleContent = titleCustom.content;
  delete titleCustom.content;

  const { ...bodyCustom } = body;
  const bodyContent = bodyCustom.content;
  delete bodyCustom.content;

  bodyCustom.component = bodyCustom.component ? bodyCustom.component : 'div';

  return (
    <Typography component="div" key={order} {...custom}>
      {titleContent ?
        <Typography dangerouslySetInnerHTML={createCleanHtml(titleContent)} {...titleCustom} />
      : ""}
      {bodyContent ?
        <Typography dangerouslySetInnerHTML={createCleanHtml(bodyContent, markdownFormatted)} {...bodyCustom} />
      : ""}
    </Typography>
  );
}

export const RenderWidgets = ({ contents }) => (
  <div>
    {_.map(_.orderBy(contents, 'order'),
      widget => {
        switch (widget.type) {
          case 'Markdown':
            return renderTypography(widget, true);
          case 'HTML':
            return renderTypography(widget);
          default:
            return;
        }
      }
    )}
  </div>
);

export const setAuthorizationToken = authToken => {
  if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}
