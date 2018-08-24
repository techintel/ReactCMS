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
import { slashDomain, hasBeenText, getPostStatusLabel, getPermalink } from '../../utils';
import { isUserCapable, onEditPost, documentTitle } from '../../utils/reactcms';
import moment from 'moment';
import Disqus from 'disqus-react';

import NotFound from '../../components/NotFound';
import Loading from '../../components/Loading';
import CategoryChips from '../../components/Lists/CategoryChips';
import TagChips from '../../components/Lists/TagChips';
import Ancestors from '../../components/Lists/Ancestors';

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
  commentCount: {
    paddingLeft: theme.spacing.unit,
    color: theme.palette.primary.light,
  },
  empty: {
    padding: '25px 0px',
  },
  discussion: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 4,
  },
});

class Post extends Component {
  state = {
    isNotFound: null,
    anchorEl: null,
    editorState: null,
  };

  componentDidMount() {
    this._isMounted = true;
    const { type, match: { params }, info: { collectionPrefix } } = this.props;

    this.props.fetchPost( type, { ...params, collectionPrefix }, post => {
      if ( this._isMounted ) {
        if ( post ) {
          this.setState({
            editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)))
          });
          documentTitle(post.title);
        } else {
          this.setState({ isNotFound: true });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleOpenMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  onDeleteClick = post_id => {
    const { type, history, info: { domain } } = this.props;

    this.props.deletePost( type, post_id, data => {
      const snackbarActionText = (data.status === 'trash') ? 'put to bin' : 'deleted';

      history.push(`${slashDomain(domain)}/`);
      this.props.openSnackbar( hasBeenText(type, data.title, snackbarActionText) );
    });
  }

  render() {
    const { post } = this.props;
    const { isNotFound, editorState } = this.state;

    if ( isNotFound ) {
      return <NotFound />;
    } else if ( !post || !editorState ) {
      return <Loading />;
    } else {
      const { type, user, history, classes,
        info: { domain },
        site: { disqus },
      } = this.props;
      const { anchorEl } = this.state;
      const deleteText = (post.status !== 'trash') ? 'Bin' : 'Delete';

      const isDeleteEnabled = isUserCapable('delete', type, user, post);
      const isEditEnabled = isUserCapable('edit', type, user, post);

      const disqusConfig = {
        url: getPermalink(domain, type, post),
        identifier: post._id,
        title: post.title,
      };

      return (
        <div>
          <Typography variant="title">{post.title}</Typography>

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
                    <MenuItem onClick={() => onEditPost(type, post._id, domain, history)}>Edit Post</MenuItem>
                  }
                  {isDeleteEnabled &&
                    <MenuItem onClick={() => this.onDeleteClick(post._id)}>{deleteText}</MenuItem>
                  }
                </Menu>
              </div>
            ) : null}
            title={type === 'post'
              ? <CategoryChips categories={post.categories} domain={domain} history={history} className={classes.categoryChips} />
              : <Ancestors type="page" items={post.ancestors} childName={post.title} domain={domain} />
            }
            subheader={
              <div>
                <span>{moment(post.date).format("dddd, MMMM D, YYYY")}</span>
                <span className={classes.status}>({getPostStatusLabel(post.status)})</span>
                {disqus && disqus.enabled_on.includes(type + 's') && (
                  <span className={classes.commentCount}>
                    <Disqus.CommentCount shortname={disqus.shortname} config={disqusConfig}>
                      Comments
                    </Disqus.CommentCount>
                  </span>
                )}
              </div>
            }
          />

          {editorState.getCurrentContent().hasText() ?
            <Editor
              editorState={editorState}
              readOnly
              wrapperClassName={classes.readOnlyEditorWrapper}
              toolbarClassName={classes.readOnlyEditorToolbar}
            /> :
            <Typography variant="subheading" gutterBottom align="center" className={classes.empty}>
              Nothing to show
            </Typography>
          }

          {type === 'post' && <TagChips tags={post.tags} domain={domain} history={history} />}
          {disqus && disqus.enabled_on.includes(type + 's') && (
            <div className={classes.discussion}>
              <Disqus.DiscussionEmbed shortname={disqus.shortname} config={disqusConfig} />
            </div>
          )}
        </div>
      );
    }
  }
}

Post.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  post: PropTypes.object,
  site: PropTypes.object.isRequired,
  fetchPost: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

function mapStateToProps({ info, posts, pages, sites, auth: { user } }, ownProps) {
  const { type, match: { params } } = ownProps;
  let post;

  switch (type) {
    case 'post':
      post = find(posts, o => {
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
      });
      break;
    case 'page':
      post = find(pages, o => o.slug === params.slug);
      break;
    default: break;
  }

  return { info, user, post,
    site: sites[info.domain],
  };
}

export default connect(mapStateToProps, { fetchPost, deletePost, openSnackbar })(
  withStyles(styles)(Post)
);
