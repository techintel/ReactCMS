import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CardHeader, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { fetchPost, deletePost } from '../../actions/fetchPosts';
import { openSnackbar } from '../../actions/openSnackbar';
import { slashDomain, hasBeenText } from '../../utils';
import { onEditPost, documentTitle } from '../../utils/reactcms';

import NotFound from '../../components/NotFound';
import Loading from '../../components/Loading';
import Ancestors from '../../components/Lists/Ancestors';
import Home from './Home';

class Tag extends Component {
  state = {
    tag: null,
    isNotFound: null,
    anchorEl: null,
  };

  componentDidMount() {
    this._isMounted = true;
    const { type, match: { params }, info: { collectionPrefix } } = this.props;

    this.props.fetchPost( type, { ...params, collectionPrefix },
      tag => {
        if ( this._isMounted ) {
          if ( tag ) {
            this.setState({ tag });
            documentTitle(tag.name);
          } else {
            this.setState({ isNotFound: true });
          }
        }
      }
    );
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

  onDeleteClick = tag_id => {
    const { type, history, info: { domain } } = this.props;

    this.props.deletePost( type, tag_id, data => {
      history.push(`${slashDomain(domain)}/admin/${type === 'category' ? 'categorie' : type}s`);
      this.props.openSnackbar( hasBeenText(type, data.name, 'deleted') );
    });
  }

  render() {
    const { tag, isNotFound } = this.state;

    if (isNotFound) {
      return <NotFound />;
    } else if (!tag) {
      return <Loading />;
    } else {
      const { type, history, info: { domain } } = this.props;
      const { anchorEl } = this.state;
      const taggedText = (type === 'tag') ? 'tagged' : 'categorized';

      return (
        <div key={tag._id}>
          <CardHeader
            action={
              <div>
                <IconButton
                  aria-owns={anchorEl ? tag._id : null}
                  aria-haspopup="true"
                  onClick={this.handleOpenMenu}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id={tag._id}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleCloseMenu}
                >
                  <MenuItem onClick={() => onEditPost(type, tag._id, domain, history)}>Edit {type}</MenuItem>
                  <MenuItem onClick={() => this.onDeleteClick(tag._id)}>Delete</MenuItem>
                </Menu>
              </div>
            }
            title={`Posts ${taggedText} [${tag.name}]`}
            subheader={
              <div>
                <span>{tag.description}</span>
                <Ancestors type={type} items={tag.ancestors} childName={tag.name} domain={domain} />
              </div>
            }
          />
          <Home type={type} tag_id={tag._id} history={history} />
        </div>
      );
    }
  }
}

Tag.propTypes = {
  type: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  fetchPost: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

function mapStateToProps({ info }) {
  return { info };
}

export default connect(mapStateToProps, { fetchPost, deletePost, openSnackbar })(
  Tag
);
