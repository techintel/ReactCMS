import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Page extends Component {
  render() {
    const { id } = this.props;

    return (
      <div>
        PAGE ID: {id}
      </div>
    );
  }
}

Page.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Page;
