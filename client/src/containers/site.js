import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import { setCurrentUserByToken } from '../actions/signin';

import Header from './parts/header';
import Footer from './parts/footer';

import Signin from './contents/signin';

class Site extends Component {
  componentWillMount() {
    const { info: { domain } } = this.props;
    const token = localStorage[`jwtToken/${domain}`];

    if (token !== undefined) {
      this.props.setCurrentUserByToken(domain, token);
    }
  }

  render() {
    const { info: { domain } } = this.props;

    return (
      <div>
        <Header />
        <Switch>
          {domain ? (
            <Route exact path="/:domain/signin" component={Signin} />
          ) : (
            <Route exact path="/signin" component={Signin} />
          )}
        </Switch>
        <Footer />
      </div>
    );
  }
}

function mapStateToProps({ info }) {
  return { info };
}

export default withRouter(
  connect(mapStateToProps, { setCurrentUserByToken })(Site)
);
