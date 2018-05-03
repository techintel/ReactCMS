import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody, TableCell, TablePagination, TableRow
} from 'material-ui/Table';
import {
  Paper, Checkbox, Button
} from 'material-ui';

import { fetchPosts, deletePost } from '../../../actions/fetchPosts';
import _ from 'lodash';
import moment from 'moment';
import { getPostStatusLabel, slugNameToValueLabel } from '../../../utils';
import { isUserCapable, onEditPost } from '../../../utils/reactcms';
import EnhancedTableToolbar from '../../../components/enhancedTableToolbar';
import EnhancedTableHead from '../../../components/enhancedTableHead';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
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

class EnhancedTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { info } = props;
    props.fetchPosts(info.collectionPrefix);

    this.state = {
      order: 'desc',
      orderBy: 'date',
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 5
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Convert `posts` object to array, to be able to use Array.prototype methods.
    prevState.data = Object.keys(nextProps.posts).map(k => nextProps.posts[k])
      .sort((a, b) => (b.date < a.date ? -1 : 1));
    return prevState;
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

    this.setState({ data, order, orderBy });
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

  handleCategoryFilter = slug => {
    const { posts } = this.props;
    const postsArr = Object.keys(posts).map((k) => posts[k]);
    const filteredData = postsArr.filter(postElem => {
      let isIncluded = false;

      if (postElem.categories) {
        postElem.categories.forEach(catElem => {
          if (catElem.slug === slug) {
            isIncluded = true;
            return;
          }
        });
      }
      return isIncluded;
    });

    this.setState({ data: filteredData });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const {
      classes, auth,
      site: { categories }
    } = this.props;
    const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          selected={selected}
          deletePost={this.props.deletePost}
          options={slugNameToValueLabel(categories)}
          onFilter={this.handleCategoryFilter}
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                const isSelected = this.isSelected(n._id);
                const isDeleteEnabled = isUserCapable('deletePost', auth, n.author);

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
                    <TableCell padding="none">
                      <Button
                        className={classes.tableCellButton}
                        onClick={() => onEditPost(n._id, this.props)}
                      >
                        {n.title}
                      </Button>
                      <div className={classes.tableCellActions}>
                        {isDeleteEnabled ? (
                          <Button
                            size="small"
                            color="secondary"
                            className={classes.tableCellButton}
                            onClick={() => this.props.deletePost(n._id)}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell padding="none">{n.author.username}</TableCell>
                    <TableCell padding="none">
                      {_.map(n.categories, (category, i) => {
                        return `${category.slug}${(i !== n.categories.length - 1) ? ", " : ""}`;
                      })}
                    </TableCell>
                    <TableCell padding="none">
                      <div>{getPostStatusLabel(n.status)}</div>
                      <div>{moment(n.date).format("YYYY/MM/DD")}</div>
                    </TableCell>
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

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps({ info, posts, auth, sites }) {
  const editable = _.omitBy(posts, (post, _id) => {
    const isEditEnabled = isUserCapable('editPost', auth, post.author);
    return !isEditEnabled;
  });

  return {
    info, auth,
    posts: editable,
    site: sites[info.domain]
  };
}

export default connect(mapStateToProps, { fetchPosts, deletePost })(
  withStyles(styles)(EnhancedTable)
);
