import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import RenderWidgets from '../Lists/RenderWidgets';

import { sidebarStyle } from '../../assets/jss/styles';

const styles = theme => ({
  ...sidebarStyle(theme),

  root: {
    '&:first-child': {
      marginBottom: theme.spacing.unit * 2,
    },
    '&:last-child': {
      marginTop: theme.spacing.unit * 2,
    },
  },
});

function Content({ widgets, classes }) {
  return widgets.length ? (
    <Paper className={classNames(classes.root, classes.paper)}>
      <RenderWidgets contents={widgets} />
    </Paper>
  ) : null;
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
  widgets: PropTypes.array.isRequired,
};

export default withStyles(styles)(Content);
