import React, { Component } from 'react';
import { connect } from 'react-redux';
import { documentTitle } from '../../utils/reactcms';

import Home from './Home';
import Page from './Page';

class FrontPage extends Component {
  componentDidMount () {
    documentTitle();
  }

  render() {
    const { history, front_page } = this.props;
    const show_on_front = (front_page && front_page.show_on_front) ? front_page.show_on_front : 'posts';
    const page_on_front = (front_page && front_page.page_on_front) ? front_page.page_on_front : 0;

    return (show_on_front === 'posts') ?
      <Home history={history} /> :
      <Page id={page_on_front} />;
  }
}

function mapStateToProps({ info, sites }) {
  return { front_page: sites[info.domain].front_page };
}

export default connect(mapStateToProps)(FrontPage);
