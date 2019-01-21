import React from 'react';
import { Typography } from '@material-ui/core';
import { documentTitle } from '../utils/reactcms';

const NotFound = () => {
  documentTitle('Page not found');

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body2" gutterBottom>
        Sorry, but the page you are looking for cannot be found.
      </Typography>
    </div>
  )
}

export default NotFound;
