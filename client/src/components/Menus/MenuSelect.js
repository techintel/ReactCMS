import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@material-ui/core';

import { MENU_ITEM_HEIGHT } from '../../assets/jss/styles';

class MenuSelect extends Component {
  state = { selected: null };

  static getDerivedStateFromProps(nextProps, prevState) {
    prevState.anchorEl = nextProps.anchorEl;
    return prevState;
  }

  handleClose = () => {
    this.props.onClose(null);
  };

  handleClick = value => {
    this.setState({ selected: value });
    this.handleClose();

    this.props.onSelect(value);
  };

  render() {
    const { id, options } = this.props;
    const { anchorEl, selected } = this.state;

    return (
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.handleClose}
        PaperProps={{
          style: {
            maxHeight: MENU_ITEM_HEIGHT * 4.5,
            width: 200,
          },
        }}
      >
        {options.map(option => (
          <MenuItem
            key={option.value}
            selected={option.value === selected}
            onClick={()=> this.handleClick(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    );
  }
}

MenuSelect.propTypes = {
  id: PropTypes.string,
  anchorEl: PropTypes.object,
  options: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MenuSelect;
