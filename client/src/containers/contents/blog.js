import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPost, deletePost } from '../../actions/fetchPosts';
import { find } from 'lodash';
import NotFound from '../../components/notFound';
import Loading from  '../../components/loading';

import { withStyles } from 'material-ui/styles';
import { Typography, Avatar, IconButton } from 'material-ui';
import { CardHeader } from 'material-ui/Card';
import Menu, { MenuItem } from 'material-ui/Menu';
import { MoreVert } from '@material-ui/icons';

import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { isUserCapable, onEditPost } from '../../utils/reactcms';
import moment from 'moment';

import CategoryChips from '../parts/content/categoryChips';

const styles = theme => ({
  chip: {
    margin: `0 ${theme.spacing.unit}px ${theme.spacing.unit}px`,
  },
  readOnlyEditorWrapper: {
    color: theme.typography.body1.color,
  },
  readOnlyEditorToolbar: {
    display: 'none',
  },
});

class Blog extends Component {
  state = {
    isNotFound: null,
    anchorEl: null,
    editorState: null
  }

  componentDidMount() {
    const {
      match: { params },
      info: { collectionPrefix }
    } = this.props;

    this.props.fetchPost({ ...params, collectionPrefix }, post => {
      if (post) {
        this.setState({
          editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)))
        });
      } else {
        this.setState({ isNotFound: true });
      }
    });
  }

  handleOpenMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  onDeleteClick = post_id => {
    this.props.deletePost(post_id, () => {
      const { history, info: { domain } } = this.props;
      history.push(`${domain ? '/' : ''}${domain}/`);
    });
  }

  render () {
    const { post } = this.props;
    const { isNotFound } = this.state;

    if (isNotFound) {
      return <NotFound />;
    } else if (post === undefined) {
      return <Loading />;
    } else {
      const { auth, history, classes } = this.props;
      const { anchorEl, editorState } = this.state;

      const isDeleteEnabled = isUserCapable('deletePost', auth, post.author);
      const isEditEnabled = isUserCapable('editPost', auth, post.author);

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
                  <MoreVert />
                </IconButton>
                <Menu
                  id={post._id}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleCloseMenu}
                >
                  {isEditEnabled ?
                    <MenuItem onClick={() => onEditPost(post._id, this.props)}>Edit Post</MenuItem>
                  : null}
                  {isDeleteEnabled ?
                    <MenuItem onClick={() => this.onDeleteClick(post._id)}>Delete</MenuItem>
                  : null}
                </Menu>
              </div>
            ) : null}
            title={
              <CategoryChips categories={post.categories} history={history} className={classes.chip} />
            }
            subheader={moment(post.date).format("dddd, MMMM D, YYYY")}
          />

          <Editor
            editorState={editorState}
            readOnly
            wrapperClassName={classes.readOnlyEditorWrapper}
            toolbarClassName={classes.readOnlyEditorToolbar}
          />
        </div>
      );
    }
  }
}

function mapStateToProps({ info, posts, auth }, ownProps) {
  const { match: { params } } = ownProps;

  return {
    info, auth,
    post: find(posts, o => {
      const dateObj = new Date(o.date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate();

      return (
        o.slug === params.slug &&
        year === Number(params.year) &&
        month === Number(params.month) &&
        day === Number(params.day)
      );
    })
  };
}

export default connect(mapStateToProps, { fetchPost, deletePost })(
  withStyles(styles)(Blog)
);
