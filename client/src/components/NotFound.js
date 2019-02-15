import React from 'react';
import { Typography } from '@material-ui/core';
import Head from '../containers/Parts/Head';

const NotFound = () => {
  const title = 'Page not found';
  const description =
    'Sorry, but the page you are looking for cannot be found.';

  return (
    <div>
      <Head name={title} description={description} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {description}
      </Typography>
    </div>
  );
};

export default NotFound;
