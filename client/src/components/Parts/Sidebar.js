import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper } from '@material-ui/core';
import RenderWidgets from '../Lists/RenderWidgets';

import { sidebarStyle } from '../../assets/jss/styles';

const styles = theme => ({
  ...sidebarStyle(theme),
});

function Sidebar({ colNum, widgets, classes }) {
  return colNum ? (
    <Grid item xs={12} md={colNum}>
      <Paper className={classes.paper}>
        <RenderWidgets contents={widgets} />
      </Paper>
    </Grid>
  ) : null;
}

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  colNum: PropTypes.number,
  widgets: PropTypes.array.isRequired,
};

export default withStyles(styles)(Sidebar);
