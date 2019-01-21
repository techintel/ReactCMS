import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { WidgetTypes } from '../../containers/Admin/Appearance/Constants';
import { DropTarget } from 'react-dnd';
import { isMenuParentDescendant } from '../../utils';

import MenuItems from '../../components/Menus/MenuItems';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.divider,
    padding: theme.spacing.unit,
    paddingRight: 0,
  },
});

const childTarget = {
  hover(props, monitor) {
    const drag = monitor.getItem();
    const hover = props;

    // Over the item children
    if (monitor.isOver()) {
      return;
    }

    // Don't make the item a child of itself
    if (drag.data._id === hover.parent) {
      return;
    }

    // The parent is already the item's parent
    if (drag.data.parent === hover.parent) {
      return;
    }

    // Check if the next parent is descended from the item
    if ( isMenuParentDescendant( drag.data._id, hover.parent, props.editingMenu.items, true ) ) {
      return;
    }

    props.moveAsChild(drag, hover);
  },
};

class MenuItemChildren extends Component {
  render() {
    const { connectDropTarget, classes } = this.props;

    return connectDropTarget && connectDropTarget(
      <div className={classes.root}>
        <MenuItems
          parent={this.props.parent}
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

MenuItemChildren.propTypes = {
  classes: PropTypes.object.isRequired,
  parent: PropTypes.string,
  editingMenu: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onField: PropTypes.func.isRequired,
  moveItem: PropTypes.func.isRequired,
  moveAsChild: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

export default DropTarget(WidgetTypes.MOVE, childTarget, (connect) => ({
  connectDropTarget: connect.dropTarget(),
}))(
  withStyles(styles)(MenuItemChildren)
);
