import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import './App.css';
import 'typeface-roboto';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { SERVER_ROOT_URL } from './config';

import Loading from './components/Loading';
import Site from './containers/Site';

class App extends Component {
  state = {
    muiTheme: createMuiTheme({
      typography: {
        useNextVariants: true,
      },
    }),
    template: null,
  };

  componentWillReceiveProps(nextProps) {
    const { sites, domain } =  nextProps;

    if ( !isEmpty(sites) ) {
      const template = sites[domain].template;

      if ( template !== this.state.template ) {
        const aScript = document.createElement('script');
        aScript.type = 'text/javascript';
        aScript.src = `${SERVER_ROOT_URL}/upload/themes/${template}/functions.js`;

        document.head.appendChild(aScript);
        aScript.onload = () => this.setState({
          muiTheme: createMuiTheme({
            ...window.themeOptions,
            typography: {
              useNextVariants: true,
            },
          }),
          template,
        });
      }
    }
  }

  render() {
    const { muiTheme } = this.state;
    const { sites } = this.props;

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="App">
          <CssBaseline />
          <BrowserRouter>
            {isEmpty(sites) ?
              <Route component={props => <Loading fetchSite={true} {...props} />} /> :
              <Site />
            }
          </BrowserRouter>
        </div>
      </MuiThemeProvider>
    );
  }
}

function mapStateToProps({ sites, info: { domain } }) {
  return { sites, domain };
}

export default connect(mapStateToProps)(App);
