import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { fetchPost, deletePost } from '../../actions/fetchPosts';
import { find } from 'lodash';

const styles = theme => ({
});

class Page extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { match: { params }, info: { collectionPrefix } } = this.props;

    this.props.fetchPost( 'page', { ...params, collectionPrefix }, post => {
      console.log(post);
    });
  }

  render() {
    const { page, match: { params: { slug } } } = this.props;
    console.log('page', page);

    return (
      <div>
        PAGE SLUG: {slug}
      </div>
    );
  }
}

Page.propTypes = {
  match: PropTypes.object.isRequired,
};

function mapStateToProps({ info, pages, auth: { user } }, ownProps) {
  const { match: { params } } = ownProps;

  return {
    info, user,
    page: find( pages, o => o.slug === params.slug )
  };
}

export default connect(mapStateToProps, { fetchPost, deletePost })(
  withStyles(styles)(Page)
);
