import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Tag from './Tag';
import PostsTable from './PostsTable';
import { fetchPosts } from '../../../actions/fetchPosts';
import Head from '../../Parts/Head';

const styles = theme => ({
  root: {
    flexGrow: 1
  }
});

class Tags extends Component {
  constructor(props) {
    super(props);
    const { type, collectionPrefix } = props;
    props.fetchPosts(type, { collectionPrefix });
  }

  render() {
    const { type, title, tags, history, classes } = this.props;
    let columnData = [
      { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
      {
        id: 'description',
        numeric: false,
        disablePadding: true,
        label: 'Description'
      },
      { id: 'slug', numeric: false, disablePadding: true, label: 'Slug' }
    ];

    if (type === 'category')
      columnData.push({
        id: 'ancestors',
        numeric: false,
        disablePadding: true,
        label: 'Ancestors'
      });

    columnData.push({
      id: 'count',
      numeric: false,
      disablePadding: true,
      label: 'Count'
    });

    return (
      <div className={classes.root}>
        <Head name={title} />
        <Grid container>
          <Grid item xs={12} md={4}>
            <Tag type={type} noHead />
          </Grid>
          <Grid item xs={12} md={8}>
            <PostsTable
              type={type}
              title={title}
              columnData={columnData}
              posts={tags}
              orderBy="name"
              history={history}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

Tags.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  history: PropTypes.object.isRequired,
  collectionPrefix: PropTypes.string.isRequired,
  tags: PropTypes.object.isRequired,
  fetchPosts: PropTypes.func.isRequired
};

function mapStateToProps(
  { categories, tags, info: { collectionPrefix } },
  { type }
) {
  tags = type === 'tag' ? tags : categories;
  return { collectionPrefix, tags };
}

const wrappedConnect = connect(
  mapStateToProps,
  { fetchPosts }
)(Tags);

export default withStyles(styles)(wrappedConnect);
