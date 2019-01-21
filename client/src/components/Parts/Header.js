import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import RenderWidgets from '../Lists/RenderWidgets';

const styles = theme => ({
  header: {
    marginBottom: 10,
  },
});

function Header({ widgets, classes }) {
  return widgets.length ? (
    <Grid item xs={12} md={12}>
      <header className={classes.header}>
        <RenderWidgets contents={widgets} />
      </header>
    </Grid>
  ) : null;
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  widgets: PropTypes.array.isRequired,
};

export default withStyles(styles)(Header);
