import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { fetchPost, deletePost } from '../../actions/fetchPosts';
import { openSnackbar } from '../../actions/openSnackbar';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Avatar, IconButton, CardHeader, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { slashDomain, hasBeenText, getPostStatusLabel } from '../../utils';
import { isUserCapable, onEditPost } from '../../utils/reactcms';
import moment from 'moment';

import NotFound from '../../components/NotFound';
import Loading from '../../components/Loading';
import CategoryChips from '../../components/Lists/CategoryChips';
import TagChips from '../../components/Lists/TagChips';

const styles = theme => ({
  readOnlyEditorWrapper: {
    color: theme.typography.body1.color,
  },
  readOnlyEditorToolbar: {
    display: 'none',
  },
  categoryChips: {
    marginBottom: theme.spacing.unit,
  },
  status: {
    paddingLeft: theme.spacing.unit,
    fontWeight: 300,
  },
});

class Blog extends Component {
  mounted = false;
  state = {
    isNotFound: null,
    anchorEl: null,
    editorState: null
  }

  componentDidMount() {
    this.mounted = true;

    const {
      match: { params },
      info: { collectionPrefix }
    } = this.props;

    this.props.fetchPost( 'post', { ...params, collectionPrefix }, post => {
      if ( this.mounted ) {
        if (post) {
          this.setState({
            editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)))
          });
        } else {
          this.setState({ isNotFound: true });
        }
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleOpenMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  onDeleteClick = post_id => {
    this.props.deletePost( 'post', post_id, data => {
      const { history, info: { domain } } = this.props;
      const snackbarActionText = (data.status === 'trash') ? 'put to bin' : 'deleted';

      history.push(`${slashDomain(domain)}/`);
      this.props.openSnackbar( hasBeenText('post', data.title, snackbarActionText) );
    });
  }

  render() {
    const { post } = this.props;
    const { isNotFound } = this.state;

    if (isNotFound) {
      return <NotFound />;
    } else if (!post) {
      return <Loading />;
    } else {
      const { user, history, classes, info: { domain } } = this.props;
      const { anchorEl, editorState } = this.state;
      const deleteText = post.status !== 'trash' ? 'Bin' : 'Delete';

      const isDeleteEnabled = isUserCapable('delete', 'post', user, post);
      const isEditEnabled = isUserCapable('edit', 'post', user, post);

      return (
        <div>
          <Typography variant="title">
            {post.title}
          </Typography>

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
                  onClick={this.handleOpenMenu}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id={post._id}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleCloseMenu}
                >
                  {isEditEnabled &&
                    <MenuItem onClick={() => onEditPost('post', post._id, domain, history)}>Edit Post</MenuItem>
                  }
                  {isDeleteEnabled &&
                    <MenuItem onClick={() => this.onDeleteClick(post._id)}>{deleteText}</MenuItem>
                  }
                </Menu>
              </div>
            ) : null}
            title={
              <CategoryChips categories={post.categories} domain={domain} history={history} className={classes.categoryChips} />
            }
            subheader={
              <div>
                <span>{moment(post.date).format("dddd, MMMM D, YYYY")}</span>
                <span className={classes.status}>({getPostStatusLabel(post.status)})</span>
              </div>
            }
          />

          <Editor
            editorState={editorState}
            readOnly
            wrapperClassName={classes.readOnlyEditorWrapper}
            toolbarClassName={classes.readOnlyEditorToolbar}
          />

          <TagChips tags={post.tags} domain={domain} history={history} />
        </div>
      );
    }
  }
}

Blog.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps({ info, posts, auth: { user } }, ownProps) {
  const { match: { params } } = ownProps;

  return {
    info, user,
    post: find(posts, o => {
      const date = new Date(o.date);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();

      return (
        o.slug === params.slug &&
        year === Number(params.year) &&
        month === Number(params.month) &&
        day === Number(params.day)
      );
    })
  };
}

export default connect(mapStateToProps, { fetchPost, deletePost, openSnackbar })(
  withStyles(styles)(Blog)
);
