// Library imports
import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux';
import configureStore from './configureStore';

import AuthRedirector from './components';

import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const store = configureStore;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthRedirector />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
