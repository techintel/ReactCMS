import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RenderWidgets } from '../../../utils';

class Footer extends Component {
  render() {
    return (
      <footer className="App-footer">
        <RenderWidgets contents={this.props.footer} />
      </footer>
    );
  }
}

function mapStateToProps({ info, sites }) {
  return { footer: sites[info.domain].footer };
}

export default connect(mapStateToProps)(Footer);
