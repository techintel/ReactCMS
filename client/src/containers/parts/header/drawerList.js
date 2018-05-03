import React, { Component } from 'react';
import { connect } from 'react-redux';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { Link } from 'react-router-dom';
import { Divider } from 'material-ui';
import { includes } from 'lodash';
import { PUBLISH_POSTS, EDIT_POSTS } from '../../capabilities';

import { withStyles } from 'material-ui/styles';
import { Collapse } from 'material-ui/transitions';
import {
  ExpandLess, ExpandMore,
  LibraryBooks, List as ListIcon, Create
} from '@material-ui/icons';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class DrawerList extends Component {
  state = { openPosts: false };

  handleClickPosts = () => {
    this.setState({ openPosts: !this.state.openPosts });
  };

  render () {
    const { classes, info: { domain }, auth: { user } } = this.props;

    return (
      <div>
        <Divider />
        <List>

          <ListItem button onClick={this.handleClickPosts}>
            <ListItemIcon>
              <LibraryBooks />
            </ListItemIcon>
            <ListItemText inset primary="Posts" />
            {this.state.openPosts ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={this.state.openPosts} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              {includes(EDIT_POSTS, user.role) ?
                <ListItem button className={classes.nested}
                  component={Link}
                  to={`${domain ? '/' : ''}${domain}/admin/posts`}
                >
                  <ListItemIcon>
                    <ListIcon />
                  </ListItemIcon>
                  <ListItemText inset primary="All Posts" />
                </ListItem>
              : null}

              {includes(PUBLISH_POSTS, user.role) ?
                <ListItem button className={classes.nested}
                  component={Link}
                  to={`${domain ? '/' : ''}${domain}/admin/post/new`}
                >
                  <ListItemIcon>
                    <Create />
                  </ListItemIcon>
                  <ListItemText inset primary="New Post" />
                </ListItem>
              : null}

            </List>
          </Collapse>

        </List>
      </div>
    );
  }
}

function mapStateToProps({ info, auth }) {
  return { info, auth };
}

export default connect(mapStateToProps)(
  withStyles(styles)(DrawerList)
);
