import React, { Component } from 'react';

class Page extends Component {
  render () {
    const { id } = this.props;

    return (
      <div>
        PAGE ID: {id}
      </div>
    );
  }
}

export default Page;
