import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { Paper, ListItem, ListItemText, Collapse, Button, TextField, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { WidgetTypes } from './Constants';
import { DropTarget, DragSource } from 'react-dnd';
import { flow, find } from 'lodash';
import { getPermalink, isMenuParentDescendant } from '../../../utils';

import MenuItemChildren from '../../../components/Menus/MenuItemChildren';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  listItem: {
    cursor: 'move',
  },
  arrow: {
    cursor: 'pointer',
  },
  content: {
    padding: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
  },
  contentField: {
    marginTop: theme.spacing.unit,
  },
  orig: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit,
    border: `solid 1px ${theme.palette.divider}`,
  },
});

const itemTarget = {
  hover(props, monitor, component) {
    const drag = monitor.getItem();
    const hover = props;

    // Don't replace item with itself
    if ( drag.data._id === hover.data._id ) {
      return;
    }

    // Check if the next parent is descended from the item
    if ( isMenuParentDescendant( drag.data._id, hover.data.parent, props.editingMenu.items ) ) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = (findDOMNode(
      component,
    )).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = (clientOffset).y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (drag.data.order < hover.data.order && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (drag.data.order > hover.data.order && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveItem(drag, hover);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().data.order = hover.data.order;
  },
};

const itemSource = {
  beginDrag(props) {
    return props;
  },
};

class MenuItem extends Component {
  state = { open: false };

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleRemove = () => {
    this.props.onRemove(this.props.data._id);
  }

  handleCancel = () => {
    this.props.onCancel(this.props.data._id);
    this.setState({ open: false });
  }

  handleField = prop => e => {
    this.props.onField(prop, this.props.data._id, e.target.value);
  }

  findPost = (list, data) => find(list, post => post._id === data.guid);

  getPermalinkById = (type, id) => {
    const { domain, pages, posts, categories } = this.props;
    let post;

    switch (type) {
      case 'page':
        post = pages[id];
        break;
      case 'category':
        post = categories[id];
        break;
      default:
        post = posts[id];
    }

    return getPermalink(domain, type, post);
  }

  render() {
    const { data, connectDragSource, connectDropTarget, pages, posts, categories, classes } = this.props;
    const { open } = this.state;
    let post, list;

    switch (data.type) {
      case 'page':
        list = pages;
        break;
      case 'post':
        list = posts;
        break;
      case 'category':
        list = categories;
        break;
      default:
        list = null;
    }

    if (list) post = this.findPost(list, data);

    return (
      <div className={classes.root}>
        <Paper>
          {connectDragSource && connectDropTarget && connectDragSource(
            connectDropTarget(
              <div>
                <ListItem button disableRipple divider className={classes.listItem}>
                  <ListItemText primary={data.label} />
                  {open ? <ExpandLess onClick={this.handleClick} className={classes.arrow} /> : <ExpandMore onClick={this.handleClick} className={classes.arrow} />}
                </ListItem>
              </div>
            )
          )}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className={classes.content}>
              {!post && <TextField label="URL" value={data.guid} onChange={this.handleField('guid')} fullWidth className={classes.contentField} />}
              <TextField label="Navigation label" value={data.label} onChange={this.handleField('label')} fullWidth className={classes.contentField} />
              {post && <Typography className={classes.orig}>Original: <a href={this.getPermalinkById(data.type, data.guid)} target="_blank">{post.title}</a></Typography>}
            </div>
            <div>
              <Button onClick={this.handleRemove} color="secondary">Remove</Button> |
              <Button onClick={this.handleCancel} color="primary">Cancel</Button>
            </div>
          </Collapse>
        </Paper>

        <MenuItemChildren
          parent={data._id}
          editingMenu={this.props.editingMenu}
          onRemove={this.props.onRemove}
          onCancel={this.props.onCancel}
          onField={this.props.onField}
          moveItem={this.props.moveItem}
          moveAsChild={this.props.moveAsChild}
        />
      </div>
    );
  }
}

MenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  editingMenu: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onField: PropTypes.func.isRequired,
  moveItem: PropTypes.func.isRequired,
  moveAsChild: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  domain: PropTypes.string.isRequired,
  pages: PropTypes.object.isRequired,
  posts: PropTypes.object.isRequired,
};

function mapStateToProps({ pages, posts, categories, info: { domain } }) {
  return { domain, pages, posts, categories };
}

export default flow(
  DragSource(
    WidgetTypes.MOVE,
    itemSource,
    (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
    }),
  ),
  DropTarget(WidgetTypes.MOVE, itemTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
  }))
)(
  connect(mapStateToProps)(
    withStyles(styles)(MenuItem)
  )
);
