import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import {
  Toolbar, Typography, IconButton, Tooltip
} from 'material-ui';
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon
} from '@material-ui/icons';
import { lighten } from 'material-ui/styles/colorManipulator';
import MenuSelect from './menuSelect';

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

class EnhancedTableToolbar extends Component {
  state = { anchorEl: null }

  handleFilterClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleDeleteClick = () => {
    const { selected, deletePost } = this.props;

    selected.forEach( post_id =>
      deletePost(post_id)
    );
  }

  handleFilterClose = anchorEl => {
    this.setState({ anchorEl });
  }

  render () {
    const { numSelected, classes, options, onFilter } = this.props;
    const { anchorEl } = this.state;

    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        <div className={classes.title}>
          {numSelected > 0 ? (
            <Typography color="inherit" variant="subheading">
              {numSelected} selected
            </Typography>
          ) : (
            <Typography variant="title">Posts</Typography>
          )}
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          {numSelected > 0 ? (
            <Tooltip title="Delete">
              <IconButton
                aria-label="Delete"
                onClick={this.handleDeleteClick}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <div>
              <Tooltip title="Filter list">
                <IconButton
                  aria-label="Filter list"
                  aria-owns={anchorEl ? 'filter-menu' : null}
                  aria-haspopup="true"
                  onClick={this.handleFilterClick}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <MenuSelect
                id="filter-menu"
                anchorEl={anchorEl}
                options={options}
                onSelect={onFilter}
                onClose={this.handleFilterClose}
              />
            </div>
          )}
        </div>
      </Toolbar>
    );
  }
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

export default withStyles(toolbarStyles)(EnhancedTableToolbar);
