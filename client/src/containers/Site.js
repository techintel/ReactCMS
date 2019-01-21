import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import { setCurrentUserByToken } from '../actions/signin';
import { openSnackbar } from '../actions/openSnackbar';

import SnackbarContentWrapper from '../components/SnackbarContentWrapper';
import Header from './Parts/Header';
import Admin from './Admin';
import Contents from './Contents';

import { drawerStyle } from '../assets/jss/styles';

const styles = theme => ({
  ...drawerStyle(theme),

  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'visible',
    position: 'relative',
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
});

class Site extends Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false };

    const token = localStorage[`jwtToken/${props.domain}`];
    if (token !== undefined) {
      props.setCurrentUserByToken(props.domain, token);
    }
  }

  onDrawerToggle = drawerOpen => {
    this.setState({ drawerOpen });
  };

  render() {
    const { classes, snackbar, isAuthenticated, domain } = this.props;
    const { drawerOpen } = this.state;
    const slashDomainParam = domain ? '/:domain' : '';

    return (
      <div className={classes.root}>
        <Header drawerOpen={drawerOpen} onDrawerToggle={this.onDrawerToggle} />
        <main className={classNames(classes.content, isAuthenticated && classes.contentLogged, drawerOpen && classes.appBarShift)}>
          <div className={classes.toolbar} />

          <Switch>
            <Route path={`${slashDomainParam}/admin`} component={Admin} />
            <Route path={`${slashDomainParam}`} component={Contents} />
          </Switch>

        </main>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={snackbar.open}
          onClose={() => this.props.openSnackbar(false)}
        >
          <SnackbarContentWrapper
            onClose={() => this.props.openSnackbar(false)}
            variant={snackbar.variant}
            message={snackbar.message}
          />
        </Snackbar>
      </div>
    );
  }
}

Site.propTypes = {
  classes: PropTypes.object.isRequired,
  snackbar: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  domain: PropTypes.string.isRequired,
  setCurrentUserByToken: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

function mapStateToProps({ snackbar, auth: { isAuthenticated }, info: { domain } }) {
  return { snackbar, isAuthenticated, domain };
}

export default withRouter(
  connect(mapStateToProps, { setCurrentUserByToken, openSnackbar })(
    withStyles(styles)(Site)
  )
);
