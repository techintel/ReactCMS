import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import { Chip, Avatar } from '@material-ui/core';
import { slashDomain } from '../../utils';

class CategoryChips extends Component {
  render() {
    const { categories, history, domain, className } = this.props;

    return map(categories, category => {
      return (
        <Chip
          key={category.slug}
          avatar={
            <Avatar>{category.name.charAt(0)}</Avatar>
          }
          label={category.name}
          onClick={() => {
            history.push(`${slashDomain(domain)}/blog/category/${category.slug}`);
          }}
          className={className}
        />
      );
    });
  }
}

CategoryChips.propTypes = {
  categories: PropTypes.array,
  history: PropTypes.object.isRequired,
  domain: PropTypes.string,
  className: PropTypes.string,
};

export default CategoryChips;
