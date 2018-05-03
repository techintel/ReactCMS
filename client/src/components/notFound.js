import React from 'react';
import { Typography } from 'material-ui';

const NotFound = () => {
  document.title = 'Page not found';

  return (
    <div>
      <Typography variant="title" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" gutterBottom>
        Sorry, but the page you are looking for cannot be found.
      </Typography>
    </div>
  )
}

export default NotFound;
