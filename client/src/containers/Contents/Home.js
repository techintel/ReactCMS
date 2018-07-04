import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import {
  CircularProgress, Avatar, IconButton, Button,
  Card, CardHeader, CardContent, CardActions,
  Menu, MenuItem
} from '@material-ui/core';
import { MoreVert, KeyboardArrowRight } from '@material-ui/icons';

import { fetchPosts, deletePost } from '../../actions/fetchPosts';
import { openSnackbar } from '../../actions/openSnackbar';
import { slashDomain, toSlug, hasBeenText } from '../../utils';
import { isUserCapable, onEditPost } from '../../utils/reactcms';
import moment from 'moment';
import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import CategoryChips from '../../components/Lists/CategoryChips';
import TagChips from '../../components/Lists/TagChips';

const styles = theme => ({
  loading: {
    padding: 20,
  },
  title: {
    display: 'inline-block',
    textTransform: 'none',
  },
  categoryChips: {
    float: 'right',
  },
  readOnlyEditorWrapper: {
    color: theme.typography.body1.color,
    maxHeight: 100,
    overflowY: 'hidden',
    borderBottom: `2px dotted ${theme.typography.caption.color}`,
  },
  readOnlyEditorToolbar: {
    display: 'none',
  },
  cardActions: {
    textAlign: 'right',
    display: 'block',
  },
  tagChips: {
    display: 'inline-block',
  },
  readMore: {
    textTransform: 'none',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class Home extends Component {
  state = {
    itemsPerLoad: 5,
    isLoading: null,
    isEndResult: null,
  };

  componentDidMount() {
    this._isMounted = true;
    this.loadPosts(0);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadPosts = postsNumber => {
    this.setState({ isLoading: true });

    const { type, tag_id, info: { collectionPrefix } } = this.props;
    const { itemsPerLoad } = this.state;
    const params = {
      collectionPrefix, status: 'publish',
      limit: itemsPerLoad, skip: postsNumber
    };

    switch (type) {
      case 'category':
        params.categories = tag_id;
        break;
      case 'tag':
        params.tags = tag_id;
        break;
      default: break;
    }

    this.props.fetchPosts( 'post', params, data => {
      if ( this._isMounted ) {
        this.setState({
          isLoading: false,
          isEndResult: (data.length < itemsPerLoad),
        });
      }
    });
  }

  handleLoadMore = () => {
    const { posts } = this.props;
    this.loadPosts(_.size(posts));
  }

  handleOpenMenu = (event, post_id) => {
    this.setState({ [post_id]: event.currentTarget });
  }

  handleCloseMenu = post_id => {
    this.setState({ [post_id]: null });
  };

  onDeleteClick = post_id => {
    this.props.deletePost( 'post', post_id,
      data => this.props.openSnackbar( hasBeenText('post', data.title, 'put to bin') )
    );
  }

  renderPosts() {
    const { user, posts, history, classes, info: { domain } } = this.props;

    return _.map( _.orderBy( posts, ['date'],['desc'] ), post => {
      const slug = toSlug(post.title);
      const anchorEl = this.state[post._id];

      const date = new Date(post.date);
      const yr = date.getFullYear();
      const mo = date.getMonth() + 1;
      const day = date.getUTCDate();
      const linkTo = `${slashDomain(domain)}/blog/${yr}/${mo}/${day}/${slug}`;

      const isDeleteEnabled = isUserCapable('delete', 'post', user, post);
      const isEditEnabled = isUserCapable('edit', 'post', user, post);

      return (
        <Card key={post._id}>
          <CardHeader
            avatar={
              <Avatar aria-label="Author">
                {post.author.username.charAt(0)}
              </Avatar>
            }
            action={( isDeleteEnabled || isEditEnabled ) ? (
              <div>
                <IconButton
                  aria-owns={anchorEl ? post._id : null}
                  aria-haspopup="true"
                  onClick={e => this.handleOpenMenu(e, post._id)}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  id={post._id}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => this.handleCloseMenu(post._id)}
                >
                  {isEditEnabled &&
                    <MenuItem onClick={() => onEditPost('post', post._id, domain, history)}>Edit Post</MenuItem>
                  }
                  {isDeleteEnabled &&
                    <MenuItem onClick={() => this.onDeleteClick(post._id)}>Bin</MenuItem>
                  }
                </Menu>
              </div>
            ) : null}
            title={
              <Button component={Link} to={linkTo} className={classes.title} fullWidth>
                {post.title}
              </Button>
            }
            subheader={
              <div>
                <span>{moment(post.date).format("dddd, MMMM D, YYYY")}</span>
                <CategoryChips categories={post.categories} domain={domain} history={history} className={classes.categoryChips} />
              </div>
            }
          />
          <CardContent>
            <Editor
              editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)))}
              readOnly
              wrapperClassName={classes.readOnlyEditorWrapper}
              toolbarClassName={classes.readOnlyEditorToolbar}
            />
            <CardActions className={classes.cardActions}>
              <TagChips tags={post.tags} domain={domain} history={history} className={classes.tagChips} />
              <Button component={Link} to={linkTo} color="primary" className={classes.readMore}>
                Read More <KeyboardArrowRight />
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      );
    });
  }

  render() {
    const { isLoading, isEndResult } = this.state;
    const { classes } = this.props;

    return (
      <div>
        {this.renderPosts()}
        {isLoading && (
          <Card className={classes.loading} align="center">
            <CircularProgress />
          </Card>
        )}
        {!isEndResult && (
          <Card align="center">
            <Button variant="outlined" size="large" color="primary" className={classes.button}
              onClick={this.handleLoadMore} disabled={isLoading}
            >
              Load More <KeyboardArrowRight />
            </Button>
          </Card>
        )}
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string,
  tag_id: PropTypes.string,
  history: PropTypes.object.isRequired,
};

const pickByTag = ( group, tag_id, posts ) => {
  return _.pickBy( posts, (value, key) => {
    let isIncluded = false;
    value[group].forEach( el => {
      if (el._id === tag_id)
        return isIncluded = true;
    });
    return isIncluded;
  });
}

function mapStateToProps({ info, posts, auth: { user } }, { type, tag_id }) {
  let published = _.omitBy( posts, (value, key) => ( value.status !== 'publish' ) );

  switch (type) {
    case 'category':
      published = pickByTag('categories', tag_id, published);
      break;
    case 'tag':
      published = pickByTag('tags', tag_id, published);
      break;
    default: break;
  }

  return { info, user, posts: published };
}

export default connect(mapStateToProps, { fetchPosts, deletePost, openSnackbar })(
  withStyles(styles)(Home)
);
