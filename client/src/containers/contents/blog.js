import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchPost, deletePost } from '../../actions/fetchPosts';
import { find } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Avatar, IconButton, CardHeader, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { slashDomain } from '../../utils';
import { isUserCapable, onEditPost } from '../../utils/reactcms';
import moment from 'moment';

import NotFound from '../../components/NotFound';
import Loading from '../../components/Loading';
import CategoryChips from '../../components/Lists/CategoryChips';

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
    this.props.deletePost('post', post_id, () => {
      const { history, info: { domain } } = this.props;
      history.push(`${slashDomain(domain)}/`);
    });
  }

  render() {
    const { post, info: { domain } } = this.props;
    const { isNotFound } = this.state;

    if (isNotFound) {
      return <NotFound />;
    } else if (post === undefined) {
      return <Loading />;
    } else {
      const { user, history, classes } = this.props;
      const { anchorEl, editorState } = this.state;

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
                    <MenuItem onClick={() => this.onDeleteClick(post._id)}>Bin</MenuItem>
                  }
                </Menu>
              </div>
            ) : null}
            title={
              <CategoryChips categories={post.categories} history={history} domain={domain} className={classes.chip} />
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

export default connect(mapStateToProps, { fetchPost, deletePost })(
  withStyles(styles)(Blog)
);
