import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { documentTitle } from '../../utils/reactcms';

import Home from './Home';
import Post from './Post';

class FrontPage extends Component {
  componentDidMount () {
    documentTitle();
  }

  render() {
    const { history, front_page } = this.props;
    const show_on_front = (front_page && front_page.show_on_front) ? front_page.show_on_front : 'posts';
    const page_on_front = (front_page && front_page.page_on_front) ? front_page.page_on_front : null;

    return (show_on_front === 'posts') ?
      <Home history={history} /> :
      <Post type="page" match={{ params: { slug: page_on_front } }} history={history} />;
  }
}

FrontPage.propTypes = {
  history: PropTypes.object.isRequired,
  front_page: PropTypes.object.isRequired,
};

function mapStateToProps({ info, sites }) {
  return { front_page: sites[info.domain].front_page };
}

export default connect(mapStateToProps)(FrontPage);
