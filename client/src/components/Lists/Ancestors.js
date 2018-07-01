import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { map } from 'lodash';
import { slashDomain } from '../../utils';

const styles = theme => ({
  item: {
    color: theme.palette.secondary.main,
  },
  itemLast: {
    color: theme.palette.primary.light,
  },
});

class Ancestors extends Component {
  render() {
    const { type, items, childName, domain, classes } = this.props;
    const isPage = (type === 'page');

    let linkToPrefix = slashDomain(domain);
    if (!isPage) linkToPrefix += `/blog/${type}`;

    return items ? (
      <div>
        {map(items, (item, index) => {
          const isLastItem = ( !childName && index === (items.length - 1) );
          const itemClass = classNames(classes.item, isLastItem && classes.itemLast);

          return (
            <span key={item._id} className={itemClass}>
              <Link to={`${linkToPrefix}/${item.slug}`} className={itemClass}>
                {isPage ? item.title : item.name}
              </Link>{!isLastItem && ' > '}
            </span>
          );
        })}
        {childName && <span className={classes.itemLast}>{childName}</span>}
      </div>
    ) : null;
  }
}

Ancestors.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.array,
  childName: PropTypes.string,
  domain: PropTypes.string.isRequired,
};

export default withStyles(styles)(Ancestors);
