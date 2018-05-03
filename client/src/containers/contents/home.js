import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../../actions/fetchPosts';
import _ from 'lodash';

import { withStyles } from 'material-ui/styles';
import { Avatar, IconButton, Button } from 'material-ui';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Menu, { MenuItem } from 'material-ui/Menu';
import { MoreVert, KeyboardArrowRight } from '@material-ui/icons';

import { isUserCapable, onEditPost } from '../../utils/reactcms';
import { toSlug } from '../../utils';
import moment from 'moment';
import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import CategoryChips from '../parts/content/categoryChips';

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
    this.state = {};

    const { info } = props;
    props.fetchPosts(info.collectionPrefix, 'publish');
  }

  handleOpenMenu = (event, post_id) => {
    this.setState({ [post_id]: event.currentTarget });
  }

  handleCloseMenu = post_id => {
    this.setState({ [post_id]: null });
  };

  renderPosts() {
    const { posts, auth, history, classes, info: { domain } } = this.props;

    return _.map(posts, post => {
      const slug = toSlug(post.title);
      const anchorEl = this.state[post._id];

      const date = new Date(post.date);
      const yr = date.getFullYear();
      const mo = date.getMonth() + 1;
      const day = date.getUTCDate();
      const linkTo = `${domain ? '/' : ''}${domain}/blog/${yr}/${mo}/${day}/${slug}`;

      const isDeleteEnabled = isUserCapable('deletePost', auth, post.author);
      const isEditEnabled = isUserCapable('editPost', auth, post.author);

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
                  {isEditEnabled ?
                    <MenuItem onClick={() => onEditPost(post._id, this.props)}>Edit Post</MenuItem>
                  : null}
                  {isDeleteEnabled ?
                    <MenuItem onClick={() => this.props.deletePost(post._id)}>Delete</MenuItem>
                  : null}
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
                  <CategoryChips categories={post.categories} history={history} className={classes.chip} />
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

  render () {
    return (
      <div>
        {this.renderPosts()}
      </div>
    );
  }
}

function mapStateToProps({ info, posts, auth }) {
  var published = _.omitBy(posts, (value, key) => {
    return ( value.status !== 'publish' );
  });

  return {
    info, auth,
    posts: published
  };
}

export default connect(mapStateToProps, { fetchPosts, deletePost })(
  withStyles(styles)(Home)
);
