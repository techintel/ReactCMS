import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ListSubheader, List } from '@material-ui/core';
import { AVAILABLE_WIDGETS } from '../../containers/Admin/Appearance/Widgets/';

import DraggableWidget from '../../containers/Admin/Appearance/DraggableWidget';

const styles = theme => ({
  root: {
    width: '100%',
  },
});

class AvailableWidgets extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Available Widgets</ListSubheader>}
        >
          {AVAILABLE_WIDGETS.map(({ type, name }) => {
            return <DraggableWidget key={type} type={type} name={name} />;
          })}
        </List>
      </div>
    );
  }
}

AvailableWidgets.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AvailableWidgets);
