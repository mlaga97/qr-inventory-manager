// Library imports
import React from 'react';
import { connect } from 'react-redux';

import App from './App';

// TODO: Handle login
class AuthRedirector extends React.Component {
  render = () => <App />
}

export default AuthRedirector;
