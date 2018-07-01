import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Chip, Avatar } from '@material-ui/core';
import { map } from 'lodash';
import { slashDomain } from '../../utils';

const styles = theme => ({
  chip: {
    margin: `0 ${theme.spacing.unit}px`,
  },
});

class CategoryChips extends Component {
  render() {
    const { categories, domain, history, classes, className } = this.props;

    return (
      <div className={className}>
        {map( categories, cat =>
          <Chip
            key={cat.slug}
            avatar={
              <Avatar>{cat.name.charAt(0)}</Avatar>
            }
            label={cat.name}
            onClick={() => history.push(`${slashDomain(domain)}/blog/category/${cat.slug}`)}
            className={classes.chip}
          />
        )}
      </div>
    );
  }
}

CategoryChips.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  categories: PropTypes.array,
  domain: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(CategoryChips);
