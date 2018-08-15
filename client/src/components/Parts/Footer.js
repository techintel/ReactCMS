import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import RenderWidgets from '../Lists/RenderWidgets';

const styles = theme => ({
  footer: {
    margin: `80px 8% 10px`,
  },
});

function Footer({ widgets, classes }) {
  return (
    <footer className={classes.footer}>
      <RenderWidgets contents={widgets} />
    </footer>
  );
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
  widgets: PropTypes.array.isRequired,
};

export default withStyles(styles)(Footer);
