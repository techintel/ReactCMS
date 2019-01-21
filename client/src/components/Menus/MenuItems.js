import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

import MenuItem from '../../containers/Admin/Appearance/MenuItem';

const styles = theme => ({
  rootMenuItems: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

class MenuItems extends Component {
  render() {
    const { parent, editingMenu, onRemove, onCancel, onField, moveItem, moveAsChild, classes } = this.props;

    return (
      <div className={classNames(!parent && classes.rootMenuItems)}>
        {editingMenu.items
          .filter(item => item.parent === parent)
          .sort((a, b) => a.order - b.order)
          .map(item => {
            return <MenuItem key={item._id}
              data={item}
              editingMenu={editingMenu}
              onRemove={onRemove}
              onCancel={onCancel}
              onField={onField}
              moveItem={moveItem}
              moveAsChild={moveAsChild}
            />;
          })
        }
      </div>
    );
  }
}

MenuItems.propTypes = {
  classes: PropTypes.object.isRequired,
  parent: PropTypes.string,
  editingMenu: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onField: PropTypes.func.isRequired,
  moveItem: PropTypes.func.isRequired,
  moveAsChild: PropTypes.func.isRequired,
};

export default withStyles(styles)(MenuItems);
