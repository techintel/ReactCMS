import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Table, TableBody, TableCell, TablePagination, TableRow,
  Paper, Checkbox, Button
} from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';
import { deletePost } from '../../actions/fetchPosts';
import { openSnackbar } from '../../actions/openSnackbar';
import { getPostStatusLabel, hasBeenText, getSorting, getFiltering } from '../../utils';
import { isUserCapable, onEditPost } from '../../utils/reactcms';

import EnhancedTableToolbar from '../../components/Tables/EnhancedTableToolbar';
import EnhancedTableHead from '../../components/Tables/EnhancedTableHead';

const styles = theme => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 510,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableCellButton: {
    padding: 0,
    minHeight: 18,
    textTransform: 'none',
  },
  tableCellActions: {
    textAlign: 'right',
    marginRight: theme.spacing.unit * 3,
  },
});

class PostsTable extends Component {
  constructor(props, context) {
    super(props, context);
    const { order, orderBy } = props;

    this.state = {
      order: order ? order : 'asc',
      orderBy,
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 5,
      filter: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Convert `posts` object to array, to be able to use Array.prototype methods.
    prevState.data = Object.keys(nextProps.posts).map(k => nextProps.posts[k]);
    return prevState;
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n._id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  handleFilter = slug => {
    this.setState({ filter: slug });
  };

  render() {
    const {
      type, title, columnData, filterList, history, classes,
      isPost, user, domain
    } = this.props;
    const filterList2 = filterList ? [{ value: false, label: title }, ...filterList] : null;
    const { data, order, orderBy, selected, rowsPerPage, page, filter } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          type={type}
          title={title}
          selected={selected}
          onDeleteStart={ids => {
            ids.forEach( id => this.setState({ ['disabled-' + id]: true }) );
            this.setState({ selected: [] });
          }}
          onDeleteEnd={ids => ids.forEach( id => this.setState({ ['disabled-' + id]: false }) )}
          filterList={filterList2}
          onFilter={this.handleFilter}
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              columnData={columnData}
            />
            <TableBody>
              {data
                .sort(getSorting(order, orderBy))
                .filter(post => getFiltering(post, type, filter))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n._id);
                  const disabledId = 'disabled-' + n._id;
                  let postTitle, isDeleteEnabled, isEditEnabled, deleteSnackbarText,
                    deleteLabel = 'Delete Permanently';

                  if ( isPost ) {
                    postTitle = n.title;
                    isDeleteEnabled = isUserCapable('delete', type, user, n);
                    isEditEnabled = isUserCapable('edit', type, user, n);

                    if ( n.status !== 'trash' ) {
                      deleteLabel = 'Move to Bin';
                      deleteSnackbarText = hasBeenText(type, postTitle, 'put to bin');
                    }
                  } else {
                    postTitle = n.name;
                    isEditEnabled = isDeleteEnabled = isUserCapable('manage', 'category', user);
                  }

                  if ( !deleteSnackbarText )
                    deleteSnackbarText = deleteSnackbarText = hasBeenText(type, postTitle, 'deleted');

                  return (
                    <TableRow
                      hover
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n._id}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onClick={event => this.handleClick(event, n._id)}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        {isEditEnabled ? (
                          <Button
                            className={classes.tableCellButton}
                            onClick={() => onEditPost(type, n._id, history, domain)}
                          >
                            {postTitle}
                          </Button>
                        ) : postTitle}
                        <div className={classes.tableCellActions}>
                          {isDeleteEnabled && (
                            <Button
                              size="small"
                              color="secondary"
                              className={classes.tableCellButton}
                              disabled={this.state[disabledId]}
                              onClick={() => {
                                this.setState({ [disabledId]: true });

                                this.props.deletePost( type, n._id, () => {
                                  this.setState({ [disabledId]: false });
                                  this.props.openSnackbar(deleteSnackbarText);
                                });
                              }}
                            >
                              {deleteLabel}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      {isPost &&
                        <TableCell component="th" scope="row" padding="none">
                          {n.author.username}
                        </TableCell>
                      }
                      {!isPost &&
                        <TableCell component="th" scope="row" padding="none">
                          {n.description}
                        </TableCell>
                      }
                      {!isPost &&
                        <TableCell component="th" scope="row" padding="none">
                          {n.slug}
                        </TableCell>
                      }
                      {isPost &&
                        <TableCell component="th" scope="row" padding="none">
                          {type === 'post' ?
                            _.map(n.categories, (category, i) => {
                              return `${category.name}${(i !== n.categories.length - 1) ? ", " : ""}`;
                            }) :
                            _.map(n.ancestors, (ancestor, i) => {
                              return `${ancestor.title}${(i !== n.ancestors.length - 1) ? " > " : ""}`;
                            })
                          }
                        </TableCell>
                      }
                      {type === 'post' &&
                        <TableCell component="th" scope="row" padding="none">
                          {_.map(n.tags, (tag, i) => {
                            return `${tag.name}${(i !== n.tags.length - 1) ? ", " : ""}`;
                          })}
                        </TableCell>
                      }
                      {( type === 'category' ) &&
                        <TableCell component="th" scope="row" padding="none">
                          {_.map(n.ancestors, (ancestor, i) => {
                            return `${ancestor.name}${(i !== n.ancestors.length - 1) ? " > " : ""}`;
                          })}
                        </TableCell>
                      }
                      {isPost &&
                        <TableCell component="th" scope="row" padding="none">
                          <div>{getPostStatusLabel(n.status)}</div>
                          <div>{moment(n.date).format("YYYY/MM/DD")}</div>
                        </TableCell>
                      }
                      {!isPost &&
                        <TableCell numeric>{n.count}</TableCell>
                      }
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

PostsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  columnData: PropTypes.array.isRequired,
  posts: PropTypes.object.isRequired,
  order: PropTypes.string,
  orderBy: PropTypes.string.isRequired,
  filterList: PropTypes.array,
  history: PropTypes.object.isRequired,
};

function mapStateToProps({ info: { domain }, auth: { user } }, { posts, type }) {
  const isPost = ( type === 'post' || type === 'page' );
  if ( isPost ) {
    posts = _.omitBy( posts, (post, _id) => {
      if ( !isUserCapable('edit', type, user, post) ) {
        return post.author.username !== user.username;
      }
    });
  }

  return { isPost, user, domain, posts };
}

export default connect(mapStateToProps, { deletePost, openSnackbar })(
  withStyles(styles)(PostsTable)
);
