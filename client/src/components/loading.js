import React, { Component } from 'react';
// import logo from '../logo.svg';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import fetchSite from '../actions/fetchSite';
import store from '..';

const styles = theme => ({
  progress: {
    position: 'absolute',
    top: 0,
    bottom: theme.spacing.unit * 10,
    left: 0,
    right: 0,
    margin: 'auto',
  },
});

class Loading extends Component {
  componentWillMount() {
    store.dispatch(fetchSite(this.props.location.pathname));
  }

  render() {
    const { classes } = this.props;

    // return <img src={logo} className={`App-logo ${classes.progress}`} alt="logo" />;
    return <CircularProgress className={classes.progress} />;
  }
}

Loading.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Loading);
