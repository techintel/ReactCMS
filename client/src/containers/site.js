import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import { setCurrentUserByToken } from '../actions/signin';
import { openSnackbar } from '../actions/openSnackbar';

import Header from './Parts/Header';
import Footer from './Parts/Footer';

import Signin from './Contents/Signin';
import FrontPage from './Contents/FrontPage';
import Blog from './Contents/Blog';
import Tag from './Contents/Tag';
import Page from './Contents/Page';
import Admin from './Admin';

import NotFound from '../components/NotFound';
import SnackbarContentWrapper from '../components/SnackbarContentWrapper';

import { drawerStyle } from '../assets/jss/styles';

const styles = theme => ({
  ...drawerStyle(theme),

  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
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
            <Route exact path={`${slashDomainParam}/signin`} component={Signin} />
            <Route exact path={`${slashDomainParam}/`} component={FrontPage} />
            <Route path={`${slashDomainParam}/admin`} component={Admin} />

            <Route exact path={`${slashDomainParam}/blog/:year/:month/:day/:slug`} component={Blog} />
            <Route exact path={`${slashDomainParam}/blog/:type/:slug`}
              render={props => {
                const { match: { params: { type, slug } } } = props;
                return <Tag type={type} key={`${type}-${slug}`} {...props} />;
              }}
            />
            <Route exact path={`${slashDomainParam}/:slug`} component={Page} />

            <Route component={NotFound} />
          </Switch>

          <Footer />
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
};

function mapStateToProps({ snackbar, auth: { isAuthenticated }, info: { domain } }) {
  return { snackbar, isAuthenticated, domain };
}

export default withRouter(
  connect(mapStateToProps, { setCurrentUserByToken, openSnackbar })(
    withStyles(styles)(Site)
  )
);
