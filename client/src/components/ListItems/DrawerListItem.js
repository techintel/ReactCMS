import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

class DrawerListItem extends Component {
  handleClick = name => () => { this.props.onOpen(name); };

  render() {
    const { name, openName, Icon, children } = this.props;
    const open = name === openName;

    return (
      <div>
        <ListItem button onClick={this.handleClick(name)}>
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <ListItemText inset primary={name} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children}
          </List>
        </Collapse>
      </div>
    );
  }
}

DrawerListItem.propTypes = {
  name: PropTypes.string.isRequired,
  openName: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  Icon: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default DrawerListItem;
