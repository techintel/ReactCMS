import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { includes } from 'lodash';
import { PUBLISH_POSTS, EDIT_POSTS } from '../capabilities';

import Post from '../contents/admin/post';
import Posts from '../contents/admin/posts';
import NotFound from '../../components/notFound';

class Admin extends Component {
  render () {
    const { auth, match: { url } } = this.props;

    const canPublishPosts = includes(PUBLISH_POSTS, auth.user.role);
    const canEditPosts = includes(EDIT_POSTS, auth.user.role);

    return (
      <Switch>

        { canPublishPosts ? (
          <Route exact path={`${url}/post/new`} component={Post} key="new" />
        ) : null }
        { canPublishPosts ? (
          <Route exact path={`${url}/post/:_id`} component={Post} key="edit" />
        ) : null }
        { canEditPosts ? (
          <Route exact path={`${url}/posts`} component={Posts} />
        ) : null }

        <Route component={NotFound} />

      </Switch>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps)(Admin);
