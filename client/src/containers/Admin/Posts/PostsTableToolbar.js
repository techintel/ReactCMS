import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import { Delete as DeleteIcon, FilterList as FilterListIcon } from '@material-ui/icons';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import MenuSelect from '../../../components/Menus/MenuSelect';
import { deletePosts } from '../../../actions/fetchPosts';
import { openSnackbar } from '../../../actions/openSnackbar';

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

class PostsTableToolbar extends Component {
  state = {
    anchorEl: null,
    deleteDisabled: false,
  };

  handleFilterClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleDeleteClick = () => {
    const { selected, type } = this.props;
    this.setState({ deleteDisabled: true });

    this.props.onDeleteStart(selected);
    this.props.deletePosts( type, selected, ({ n }) => {
      const textItems = `${n} item${n > 1 ? 's' : ''}`;
      const textHasHave = ( n > 1 ) ? 'have' : 'has';

      this.props.openSnackbar( `${textItems} ${textHasHave} been deleted.` );
      this.props.onDeleteEnd(selected);
      this.setState({ deleteDisabled: false });
    });
  }

  handleFilterClose = anchorEl => {
    this.setState({ anchorEl });
  }

  render() {
    const { numSelected, title, filterList, onFilter, classes } = this.props;
    const { anchorEl, deleteDisabled } = this.state;

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
            <Typography variant="title" id="tableTitle">
              {title}
            </Typography>
          )}
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          {numSelected > 0 ? (
            <Tooltip title="Delete">
              <IconButton aria-label="Delete"
                onClick={this.handleDeleteClick}
                disabled={deleteDisabled}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            ( filterList && onFilter ) && (
              <div>
                <Tooltip title="Filter list">
                  <IconButton aria-label="Filter list"
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
                  options={filterList}
                  onSelect={onFilter}
                  onClose={this.handleFilterClose}
                />
              </div>
            )
          )}
        </div>
      </Toolbar>
    );
  }
};

PostsTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  selected: PropTypes.array.isRequired,
  onDeleteStart: PropTypes.func.isRequired,
  onDeleteEnd: PropTypes.func.isRequired,
  filterList: PropTypes.array,
  onFilter: PropTypes.func,
  deletePosts: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

export default connect(null, { deletePosts, openSnackbar })(
  withStyles(toolbarStyles)(PostsTableToolbar)
);
