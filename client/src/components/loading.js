import React, { Component } from 'react';
// import logo from '../logo.svg';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import fetchSite from '../actions/fetchSite';
import store from '..';

const styles = theme => ({
  progressFetch: {
    position: 'absolute',
    top: 0,
    bottom: theme.spacing.unit * 10,
    left: 0,
    right: 0,
    margin: 'auto',
  },
  progressLoad: {
    display: 'block',
    margin: '10% auto 20%',
  },
});

class Loading extends Component {
  constructor(props) {
    super(props);

    if (props.fetchSite) {
      store.dispatch(fetchSite(props.location.pathname));
    }
  }

  render() {
    const { classes, fetchSite } = this.props;

    // return <img src={logo} className={`App-logo ${classes.progress}`} alt="logo" />;
    return <CircularProgress className={fetchSite ? classes.progressFetch : classes.progressLoad} />;
  }
}

Loading.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Loading);
