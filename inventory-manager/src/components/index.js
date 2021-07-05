// Library imports
import React from 'react';
import { connect } from 'react-redux';

import App from './App';
import LoginPage from './LoginPage'

// TODO: Handle login
class AuthRedirector extends React.Component {
  render = () => {
    if (this.props.auth) {
      return <App />;
    } else {
      return <LoginPage />;
    }
  }
}

export default connect(
  state => ({
    auth: state.auth,
  }),
  dispatch => ({
    dispatch,
  }),
)(AuthRedirector);
