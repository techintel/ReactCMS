import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText, Collapse, Button, Divider } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

const styles = theme => ({
  listItem: {
    overflow: 'hidden',
  },
  collapse: {
    paddingBottom: theme.spacing.unit * 2,
  },
  actions: {
    textAlign: 'right',
  },
  children: {
    height: 200,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
});

class AddMenuItem extends Component {
  handleOpen = name => () => { this.props.onOpen(name); }
  handleAdd = name => () => { this.props.onAdd(name); }

  render() {
    const { name, openName, disabled, children, classes } = this.props;
    const open = name === openName;

    return (
      <div>
        <ListItem button onClick={this.handleOpen(name)} className={classes.listItem} divider>
          <ListItemText primary={name} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit className={classes.collapse}>
          <div className={classes.children}>
            {children}
          </div>
          <div className={classes.actions}>
            <Button variant="outlined" size="small" onClick={this.handleAdd(name)} disabled={disabled}>
              Add to Menu
            </Button>
          </div>
        </Collapse>
        <Divider />
      </div>
    );
  }
}

AddMenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  openName: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default withStyles(styles)(AddMenuItem);
