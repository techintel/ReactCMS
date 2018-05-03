import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import { setCurrentUserByToken } from '../actions/signin';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';

import Header from './parts/header/';
import Footer from './parts/footer';

import Signin from './contents/signin';
import FrontPage from './contents/frontPage';
import Blog from './contents/blog';

import Admin from './templates/admin';
import NotFound from '../components/notFound';

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
    this.state = {
      drawerOpen: false
    };

    const { domain } = props.info;
    const token = localStorage[`jwtToken/${domain}`];

    if (token !== undefined) {
      props.setCurrentUserByToken(domain, token);
    }
  }

  onDrawerToggle = drawerOpen => {
    this.setState({ drawerOpen });
  };

  render() {
    const {
      classes,
      info: { domain },
      auth: { isAuthenticated }
    } = this.props;
    const { drawerOpen } = this.state;

    return (
      <div className={classes.root}>
        <Header drawerOpen={drawerOpen} onDrawerToggle={this.onDrawerToggle} />
        <main className={classNames(classes.content, isAuthenticated && classes.contentLogged, drawerOpen && classes.appBarShift)}>
          <div className={classes.toolbar} />

          <Switch>
            <Route exact path={`${domain ? '/:domain' : ''}/signin`} component={Signin} />
            <Route exact path={`${domain ? '/:domain' : ''}/`} component={FrontPage} />
            <Route path={`${domain ? '/:domain' : ''}/admin`} component={Admin} />
            <Route exact path={`${domain ? '/:domain' : ''}/blog/:year/:month/:day/:slug`} component={Blog} />
            <Route component={NotFound} />
          </Switch>

          <Footer />
        </main>
      </div>
    );
  }
}

function mapStateToProps({ info, auth }) {
  return { info, auth };
}

export default withRouter(
  connect(mapStateToProps, { setCurrentUserByToken })(
    withStyles(styles)(Site)
  )
);
