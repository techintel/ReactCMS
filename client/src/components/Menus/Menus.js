import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab } from '@material-ui/core';
import { documentTitle } from '../../utils/reactcms';

import EditMenus from '../../containers/Admin/Appearance/EditMenus';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
});

class Menus extends Component {
  state = { value: 0 };

  componentDidMount() {
    documentTitle('Menus');
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <Paper className={classes.root}>
        <Tabs
          value={value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Edit Menus" />
        </Tabs>
        {value === 0 && <EditMenus />}
      </Paper>
    );
  }
}

Menus.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Menus);
