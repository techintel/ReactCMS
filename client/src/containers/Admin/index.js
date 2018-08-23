import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { isUserCapable } from '../../utils/reactcms';

import NotFound from '../../components/NotFound';
import Posts from './Posts/Posts';
import Post from './Posts/Post';
import Tags from './Posts/Tags';
import Tag from './Posts/Tag';
import Themes from './Appearance/Themes';
import Widgets from './Appearance/Widgets';
import Disqus from './Settings/Disqus';

class Admin extends Component {
  render() {
    const { user, match: { url } } = this.props;

    const canEditPosts = isUserCapable('edit', 'post', user);
    const canEditPages = isUserCapable('edit', 'page', user);
    const canManageCategories = isUserCapable('manage', 'category', user);

    return (
      <Switch>

        {canEditPosts
          && <Route exact path={`${url}/posts/new`} component={Post} key="new-post" />}
        {canEditPosts
          && <Route exact path={`${url}/posts/post/:_id`} component={Post} key="edit-post" />}
        {canEditPosts && (
          <Route exact path={`${url}/posts`} render={props =>
            <Posts type="post" title="Posts" key="posts" {...props} />
          } />
        )}

        {canManageCategories && (
          <Route exact path={`${url}/posts/categories`} key="categories" render={props =>
            <Tags type="category" title="Categories" {...props} />
          } />
        )}
        {canManageCategories && (
          <Route exact path={`${url}/posts/category/:_id`} key="edit-category" render={props =>
            <Tag type="category" {...props} />
          } />
        )}

        {canManageCategories && (
          <Route exact path={`${url}/posts/tags`} key="tags" render={props =>
            <Tags type="tag" title="Tags" {...props} />
          } />
        )}
        {canManageCategories && (
          <Route exact path={`${url}/posts/tag/:_id`} key="edit-tag" render={props =>
            <Tag type="tag" {...props} />
          } />
        )}

        {canEditPages
          && <Route exact path={`${url}/pages/new`} component={Post} key="new-page" />}
        {canEditPages
          && <Route exact path={`${url}/pages/page/:_id`} component={Post} key="edit-page" />}
        {canEditPages && (
          <Route exact path={`${url}/pages`} render={props =>
            <Posts type="page" title="Pages" key="pages" {...props} />
          } />
        )}

        {isUserCapable('switch', 'theme', user)
          && <Route exact path={`${url}/appearance/themes`} component={Themes} />}
        {isUserCapable('edit_theme', 'option', user)
          && <Route exact path={`${url}/appearance/widgets`} component={Widgets} />}

        {isUserCapable('manage', 'option', user)
          && <Route exact path={`${url}/settings/disqus`} component={Disqus} />}

        <Route component={NotFound} />

      </Switch>
    );
  }
}

Admin.propTypes = {
  user: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

function mapStateToProps({ auth: { user } }) {
  return { user };
}

export default connect(mapStateToProps)(Admin);
