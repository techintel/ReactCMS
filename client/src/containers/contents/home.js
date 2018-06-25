import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../../actions/fetchPosts';
import _ from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import {
  Avatar, IconButton, Button,
  Card, CardHeader, CardContent, CardActions,
  Menu, MenuItem
} from '@material-ui/core';
import { MoreVert, KeyboardArrowRight } from '@material-ui/icons';

import { slashDomain, toSlug } from '../../utils';
import { isUserCapable, onEditPost } from '../../utils/reactcms';
import moment from 'moment';
import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import Loading from '../../components/Loading';
import CategoryChips from '../../components/Lists/CategoryChips';

const styles = theme => ({
  categories: {
    float: 'right',
  },
  chip: {
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px 0`,
  },
  title: {
    display: 'inline-block',
    textTransform: 'none',
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
  readMore: {
    textTransform: 'none',
  }
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { isInitialized: false };

    const { info: { collectionPrefix } } = props;
    props.fetchPosts(
      'post', collectionPrefix, 'publish',
      () => this.setState({ isInitialized: true })
    );
  }

  handleOpenMenu = (event, post_id) => {
    this.setState({ [post_id]: event.currentTarget });
  }

  handleCloseMenu = post_id => {
    this.setState({ [post_id]: null });
  };

  renderPosts() {
    const { posts, user, history, classes, info: { domain } } = this.props;

    return _.map(posts, post => {
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
                    <MenuItem onClick={() => this.props.deletePost('post', post._id)}>Bin</MenuItem>
                  }
                </Menu>
              </div>
            ) : null}
            title={
              <Button
                component={Link}
                to={linkTo}
                className={classes.title}
                fullWidth
              >
                {post.title}
              </Button>
            }
            subheader={
              <div>
                {moment(post.date).format("dddd, MMMM D, YYYY")}
                <div className={classes.categories}>
                  <CategoryChips categories={post.categories} history={history} domain={domain} className={classes.chip} />
                </div>
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
              <Button
                component={Link}
                to={linkTo}
                color="primary"
                className={classes.readMore}
              >
                Read More <KeyboardArrowRight />
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      );
    });
  }

  render() {
    const { isInitialized } = this.state;

    return !isInitialized ? <Loading /> : (
      <div>
        {this.renderPosts()}
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

function mapStateToProps({ info, posts, auth: { user } }) {
  const published = _.omitBy(posts, (value, key) => {
    return ( value.status !== 'publish' );
  });

  return {
    info, user,
    posts: published
  };
}

export default connect(mapStateToProps, { fetchPosts, deletePost })(
  withStyles(styles)(Home)
);
