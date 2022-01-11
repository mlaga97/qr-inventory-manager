// Library Imports
import React from 'react';
import ReactDOM from 'react-dom';

// Style Imports
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Component Imports
import AuthRedirector from './components';

// Redux Setup
import { Provider } from 'react-redux';
import configureStore from './configureStore';
const store = configureStore;

// Wrap the actual app so that we can forget about the above boilerplate
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthRedirector />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
