import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
  MenuItem, ListItemIcon, ListItemText,
  ClickAwayListener, Grow, Paper, Popper,
} from '@material-ui/core';
import { Pages, InsertDriveFile, Link, Category, ExpandMore } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { onViewPost } from '../../../../../../utils/reactcms';
import { fetchPost } from '../../../../../../actions/fetchPosts';

import MenuListing from './MenuListing';

const styles = theme => ({
  horizontalItem: {
    display: 'inline-block',
  },
  menuItem: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& $primary, & $icon': {
        color: theme.palette.common.white,
      },
    },
  },
  primary: {},
  icon: {},
  popper: {
    zIndex: 1,
  },
});

class MenuItemContainer extends Component {
  state = {
    open: false,
    pathname: '',
  };

  handleToggle = (hasChild, item) => () => {
    if (hasChild) {
      this.setState(state => ({ open: !state.open }));
    } else {
      const { history, info: { domain, collectionPrefix } } = this.props;

      switch (item.type) {
        case 'custom':
          window.location.href = item.guid;
          break;
        default:
          let posts;
          switch (item.type) {
            case 'page':
              posts = this.props.pages;
              break;
            case 'category':
              posts = this.props.categories;
              break;
            default:
              posts = this.props.posts;
              break;
          }

          const foundPost = _.find( posts, o => o._id === item.guid );
          if (foundPost === undefined) {
            this.setState({ pathname: history.location.pathname });

            this.props.fetchPost( item.type, { collectionPrefix, _id: item.guid }, res => {
              if (this.state.pathname === history.location.pathname)
                onViewPost( item.type, res, domain, history );
            } );
          } else {
            onViewPost( item.type, foundPost, domain, history );
          }
          break;
      }
    }
  }

  handleClose = event => {
    if (this.anchorEl.contains(event.target))
      return;

    this.setState({ open: false });
  }

  render () {
    const { data, items, horizontal, classes } = this.props;
    const { open } = this.state;

    const menuName = `menu-${data._id}`;
    let Icon;

    const children = items.filter(el => el.parent === data._id);
    const hasChild = children.length > 0;

    if (!hasChild) {
      switch (data.type) {
        case 'page':
          Icon = Pages;
          break;
        case 'custom':
          Icon = Link;
          break;
        case 'category':
          Icon = Category;
          break;
        default:
          Icon = InsertDriveFile;
          break;
      }
    }

    return (
      <div className={classNames(horizontal && classes.horizontalItem)}>
        <MenuItem className={classes.menuItem}
          button
          buttonRef={node => { this.anchorEl = node; }}
          aria-owns={open ? menuName : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle(hasChild, data)}
        >
          {!hasChild && (
            <ListItemIcon className={classes.icon}>
              <Icon />
            </ListItemIcon>
          )}
          <ListItemText classes={{ primary: classes.primary }} inset={!data.parent} primary={data.label} />
          {hasChild && <ExpandMore />}
        </MenuItem>

        {hasChild && (
          <Popper open={open} anchorEl={this.anchorEl} transition disablePortal className={classes.popper}>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                id={menuName}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={this.handleClose}>
                    <MenuListing parent={data._id} items={items} />
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        )}
      </div>
    );
  }
}

MenuItemContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  horizontal: PropTypes.bool,
  info: PropTypes.object.isRequired,
  posts: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  fetchPost: PropTypes.func.isRequired,
};

function mapStateToProps({ info, posts, pages, categories }) {
  return { info, posts, pages, categories };
}

export default withRouter(
  connect(mapStateToProps, { fetchPost })(
    withStyles(styles)(MenuItemContainer)
  )
);
