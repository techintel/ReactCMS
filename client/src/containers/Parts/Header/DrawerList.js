import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText, Divider, Collapse } from '@material-ui/core';
import {
  ExpandLess, ExpandMore,
  LibraryAdd, LibraryBooks, Create, BookmarkBorder, Label,
  ColorLens, FormatPaint, Widgets,
  List as ListIcon
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { slashDomain } from '../../../utils';
import { isUserCapable } from '../../../utils/reactcms';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
});

class DrawerList extends Component {
  state = {
    openPosts: false,
    openPages: false,
    openAppearance: false,
  };

  handlePostsClick = () => {
    this.setState({ openPosts: !this.state.openPosts });
  };

  handlePagesClick = () => {
    this.setState({ openPages: !this.state.openPages });
  };

  handleAppearanceClick = () => {
    this.setState({ openAppearance: !this.state.openAppearance });
  };

  render() {
    const { classes, info: { domain }, auth: { user } } = this.props;
    const canEditPosts = isUserCapable('edit', 'post', user);
    const canManageCategories = isUserCapable('manage', 'category', user);

    return (
      <div>
        <Divider />
        <List>

          {( canEditPosts || canManageCategories ) && (
            <div>
              <ListItem button onClick={this.handlePostsClick}>
                <ListItemIcon>
                  <LibraryAdd />
                </ListItemIcon>
                <ListItemText inset primary="Posts" />
                {this.state.openPosts ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.openPosts} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

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
                      to={`${slashDomain(domain)}/admin/post/new`}
                    >
                      <ListItemIcon>
                        <Create />
                      </ListItemIcon>
                      <ListItemText inset primary="Add New" />
                    </ListItem>
                  }

                  {canManageCategories &&
                    <ListItem button className={classes.nested} component={Link}
                      to={`${slashDomain(domain)}/admin/categories`}
                    >
                      <ListItemIcon>
                        <BookmarkBorder />
                      </ListItemIcon>
                      <ListItemText inset primary="Categories" />
                    </ListItem>
                  }

                  {canManageCategories &&
                    <ListItem button className={classes.nested} component={Link}
                      to={`${slashDomain(domain)}/admin/tags`}
                    >
                      <ListItemIcon>
                        <Label />
                      </ListItemIcon>
                      <ListItemText inset primary="Tags" />
                    </ListItem>
                  }

                </List>
              </Collapse>
            </div>
          )}

          {isUserCapable('edit', 'page', user) && (
            <div>
              <ListItem button onClick={this.handlePagesClick}>
                <ListItemIcon>
                  <LibraryBooks />
                </ListItemIcon>
                <ListItemText inset primary="Pages" />
                {this.state.openPages ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.openPages} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

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
                      to={`${slashDomain(domain)}/admin/page/new`}
                    >
                      <ListItemIcon>
                        <Create />
                      </ListItemIcon>
                      <ListItemText inset primary="Add New" />
                    </ListItem>
                  }

                </List>
              </Collapse>
            </div>
          )}

          {isUserCapable('switch', 'theme', user) && (
            <div>
              <ListItem button onClick={this.handleAppearanceClick}>
                <ListItemIcon>
                  <ColorLens />
                </ListItemIcon>
                <ListItemText inset primary="Appearance" />
                {this.state.openAppearance ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.openAppearance} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

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

                </List>
              </Collapse>
            </div>
          )}

        </List>
      </div>
    );
  }
}

DrawerList.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps({ info, auth }) {
  return { info, auth };
}

export default connect(mapStateToProps)(
  withStyles(styles)(DrawerList)
);
