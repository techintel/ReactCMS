import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Avatar, Chip, Paper } from '@material-ui/core';
import LabelIcon from '@material-ui/icons/Label';
import { map } from 'lodash';
import { slashDomain } from '../../utils';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: theme.spacing.unit / 2,
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
});

class TagChips extends Component {
  render() {
    const { tags, domain, history, classes, className } = this.props;

    return (
      <Paper className={classNames(classes.root, className)}>
        {map( tags, data => {
          const avatar = (
            <Avatar>
              <LabelIcon className={classes.svgIcon} />
            </Avatar>
          );

          return (
            <Chip
              key={data.slug}
              avatar={avatar}
              label={data.name}
              onClick={() => history.push(`${slashDomain(domain)}/blog/tag/${data.slug}`)}
              className={classes.chip}
            />
          );
        })}
      </Paper>
    );
  }
}

TagChips.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  tags: PropTypes.array,
  domain: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(TagChips);
