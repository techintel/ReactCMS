import React, { Component } from 'react';
import { connect } from 'react-redux';

import Home from './home';
import Page from './page';

class FrontPage extends Component {
  componentDidMount () {
    const { site } = this.props;
    document.title = site.title;
  }

  render () {
    const { history, site: { front_page } } = this.props;
    const show_on_front = (front_page && front_page.show_on_front) ? front_page.show_on_front : 'posts';
    const page_on_front = (front_page && front_page.page_on_front) ? front_page.page_on_front : 0;

    return (show_on_front === 'posts') ?
      <Home history={history} /> :
      <Page id={page_on_front} />;
  }
}

function mapStateToProps({ info, sites }) {
  return { site: sites[info.domain] };
}

export default connect(mapStateToProps)(FrontPage);
