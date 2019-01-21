import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MenuList, ListSubheader } from '@material-ui/core';

import MenuItemContainer from './MenuItemContainer';

class MenuListing extends Component {
  render () {
    const { title, parent, items, horizontal } = this.props;

    return (
      <MenuList subheader={title && (<ListSubheader>{title}</ListSubheader>)}>
        {items.filter(el => parent ? el.parent === parent : !el.parent)
          .map(el => <MenuItemContainer key={el._id} data={el} items={items} horizontal={horizontal} />)
        }
      </MenuList>
    );
  }
}

MenuListing.propTypes = {
  title: PropTypes.string,
  parent: PropTypes.string,
  items: PropTypes.array.isRequired,
  horizontal: PropTypes.bool,
};

export default MenuListing;
