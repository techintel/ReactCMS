import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab } from '@material-ui/core';
import PostsTable from './PostsTable';
import { fetchPosts } from '../../../actions/fetchPosts';
import { omitBy } from 'lodash';
import { slugNameToValueLabel, slugTitleToValueLabel } from '../../../utils';
import Head from '../../Parts/Head';

const styles = theme => ({
  root: {
    flexGrow: 1
  }
});

const postsColumns = [
  { id: 'title', numeric: false, disablePadding: true, label: 'Title' },
  { id: 'author', numeric: false, disablePadding: true, label: 'Author' },
  {
    id: 'categories',
    numeric: false,
    disablePadding: true,
    label: 'Categories'
  },
  { id: 'tags', numeric: false, disablePadding: true, label: 'Tags' },
  { id: 'date', numeric: false, disablePadding: true, label: 'Date' }
];
const pagesColumns = [
  { id: 'title', numeric: false, disablePadding: true, label: 'Title' },
  { id: 'author', numeric: false, disablePadding: true, label: 'Author' },
  { id: 'ancestors', numeric: false, disablePadding: true, label: 'Ancestors' },
  { id: 'date', numeric: false, disablePadding: true, label: 'Date' }
];

class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = { value: 0 };

    const { collectionPrefix, type } = props;
    props.fetchPosts(type, { collectionPrefix });
    if (type === 'post') props.fetchPosts('category', { collectionPrefix });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { type, title, posts, categories, history, classes } = this.props;
    const { value } = this.state;
    let columnData, filterList;

    switch (type) {
      case 'post':
        columnData = postsColumns;
        filterList = slugNameToValueLabel(categories);
        break;

      case 'page':
        columnData = pagesColumns;
        filterList = slugTitleToValueLabel(posts);
        break;

      default:
        break;
    }

    const all = omitBy(posts, (value, key) => value.status === 'trash');
    const published = omitBy(posts, (value, key) => value.status !== 'publish');
    const draft = omitBy(posts, (value, key) => value.status !== 'draft');
    const bin = omitBy(posts, (value, key) => value.status !== 'trash');

    let tabTitle, tabPosts;
    switch (value) {
      case 0:
        tabTitle = `All ${title}`;
        tabPosts = all;
        break;

      case 1:
        tabTitle = `Published ${title}`;
        tabPosts = published;
        break;

      case 2:
        tabTitle = `Incomplete ${title}`;
        tabPosts = draft;
        break;

      case 3:
        tabTitle = `${title} in the Trash`;
        tabPosts = bin;
        break;

      default:
        break;
    }

    return (
      <Paper className={classes.root}>
        <Head name={`${type}s`} />
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All" />
          <Tab label="Published" />
          <Tab label="Draft" />
          <Tab label="Bin" />
        </Tabs>
        <PostsTable
          type={type}
          title={tabTitle}
          columnData={columnData}
          posts={tabPosts}
          order="desc"
          orderBy="date"
          filterList={filterList}
          history={history}
        />
      </Paper>
    );
  }
}

Posts.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  posts: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  collectionPrefix: PropTypes.string.isRequired,
  fetchPosts: PropTypes.func.isRequired
};

function mapStateToProps(
  { posts, pages, categories, info: { collectionPrefix } },
  { type }
) {
  if (type === 'page') posts = pages;

  return { posts, categories, collectionPrefix };
}

export default connect(
  mapStateToProps,
  { fetchPosts }
)(withStyles(styles)(Posts));
