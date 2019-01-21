import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import {
  LibraryAdd, LibraryBooks, List as ListIcon, Create, BookmarkBorder, Label,
  ColorLens, FormatPaint, Widgets, Menu,
  Settings, Comment,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { slashDomain } from '../../../utils';
import { isUserCapable } from '../../../utils/reactcms';

import DrawerListItem from '../../../components/ListItems/DrawerListItem';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
});

class DrawerList extends Component {
  state = { openName: null };

  onOpen = name => {
    this.setState({ openName: this.state.openName === name ? null : name });
  }

  render() {
    const { domain, user, classes } = this.props;
    const { openName } = this.state;

    const canEditPosts = isUserCapable('edit', 'post', user);
    const canManageCategories = isUserCapable('manage', 'category', user);

    return (
      <div>
        <Divider />
        <List>

          {( canEditPosts || canManageCategories ) && (
            <DrawerListItem name="Posts" openName={openName} onOpen={this.onOpen} Icon={LibraryAdd}>

              {canEditPosts &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/posts`}
                >
                  <ListItemIcon>
                    <ListIcon />
                  </ListItemIcon>
                  <ListItemText inset primary="All Posts" />
                </ListItem>
              }

              {canEditPosts &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/posts/new`}
                >
                  <ListItemIcon>
                    <Create />
                  </ListItemIcon>
                  <ListItemText inset primary="Add New" />
                </ListItem>
              }

              {canManageCategories &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/posts/categories`}
                >
                  <ListItemIcon>
                    <BookmarkBorder />
                  </ListItemIcon>
                  <ListItemText inset primary="Categories" />
                </ListItem>
              }

              {canManageCategories &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/posts/tags`}
                >
                  <ListItemIcon>
                    <Label />
                  </ListItemIcon>
                  <ListItemText inset primary="Tags" />
                </ListItem>
              }

            </DrawerListItem>
          )}

          {isUserCapable('edit', 'page', user) && (
            <DrawerListItem name="Pages" openName={openName} onOpen={this.onOpen} Icon={LibraryBooks}>

              {isUserCapable('edit', 'page', user) &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/pages`}
                >
                  <ListItemIcon>
                    <ListIcon />
                  </ListItemIcon>
                  <ListItemText inset primary="All Pages" />
                </ListItem>
              }

              {isUserCapable('edit', 'page', user) &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/pages/new`}
                >
                  <ListItemIcon>
                    <Create />
                  </ListItemIcon>
                  <ListItemText inset primary="Add New" />
                </ListItem>
              }

            </DrawerListItem>
          )}

          {isUserCapable('switch', 'theme', user) && (
            <DrawerListItem name="Appearance" openName={openName} onOpen={this.onOpen} Icon={ColorLens}>

              {isUserCapable('switch', 'theme', user) &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/appearance/themes`}
                >
                  <ListItemIcon>
                    <FormatPaint />
                  </ListItemIcon>
                  <ListItemText inset primary="Themes" />
                </ListItem>
              }

              {isUserCapable('edit_theme', 'option', user) &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/appearance/widgets`}
                >
                  <ListItemIcon>
                    <Widgets />
                  </ListItemIcon>
                  <ListItemText inset primary="Widgets" />
                </ListItem>
              }

              {isUserCapable('edit_theme', 'option', user) &&
                <ListItem button className={classes.nested} component={Link}
                  to={`${slashDomain(domain)}/admin/appearance/menus`}
                >
                  <ListItemIcon>
                    <Menu />
                  </ListItemIcon>
                  <ListItemText inset primary="Menus" />
                </ListItem>
              }

            </DrawerListItem>
          )}

          {isUserCapable('manage', 'option', user) && (
            <DrawerListItem name="Settings" openName={openName} onOpen={this.onOpen} Icon={Settings}>

              <ListItem button className={classes.nested} component={Link}
                to={`${slashDomain(domain)}/admin/settings/disqus`}
              >
                <ListItemIcon>
                  <Comment />
                </ListItemIcon>
                <ListItemText inset primary="Disqus" />
              </ListItem>

            </DrawerListItem>
          )}

        </List>
      </div>
    );
  }
}

DrawerList.propTypes = {
  classes: PropTypes.object.isRequired,
  domain: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
};

function mapStateToProps({ info: { domain }, auth: { user } }) {
  return { domain, user };
}

export default connect(mapStateToProps)(
  withStyles(styles)(DrawerList)
);
