import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { Chip, Avatar } from 'material-ui';

class CategoryChips extends Component {
  render () {
    const { categories, history, className, info: { domain } } = this.props;

    return map(categories, category => {
      return (
        <Chip
          key={category.slug}
          avatar={
            <Avatar>{category.name.charAt(0)}</Avatar>
          }
          label={category.name}
          onClick={() => {
            history.push(`${domain ? '/' : ''}${domain}/blog/category/${category.slug}`);
          }}
          className={className}
        />
      );
    });
  }
}

function mapStateToProps({ info }) {
  return { info };
}

export default connect(mapStateToProps)(CategoryChips);
