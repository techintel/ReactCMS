import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import './App.css';
import 'typeface-roboto';
import Reboot from 'material-ui/Reboot';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import Loading from './components/loading';
import Site from './containers/site';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <Reboot />
          <BrowserRouter>
            {isEmpty(this.props.sites) ?
              <Route component={Loading} /> :
              <Site />
            }
          </BrowserRouter>
        </div>
      </MuiThemeProvider>
    );
  }
}

function mapStateToProps({ sites }) {
  return { sites };
}

export default connect(mapStateToProps)(App);
