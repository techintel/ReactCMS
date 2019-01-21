import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Paper } from '@material-ui/core';

import MenuListing from './common/MenuListing';

class RenderMenu extends Component {
  render () {
    const { menus, widget: { title, body } } = this.props;

    const menuId = body ? body.menuId : null;
    const menu = menus.find( el => el._id === menuId );
    const items = menu ? menu.items : [];

    const direction = body ? body.direction : null;
    const horizontal = direction === 'horizontal';

    return (
      <Paper>
        <MenuListing title={title} items={items} horizontal={horizontal} />
      </Paper>
    );
  }
}

RenderMenu.propTypes = {
  widget: PropTypes.object.isRequired,
  menus: PropTypes.array.isRequired,
};

function mapStateToProps({ sites, info: { domain } }) {
  return { menus: sites[domain].menus };
}

RenderMenu = connect(mapStateToProps)(
  RenderMenu
);
export { RenderMenu };
