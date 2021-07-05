// Library Imports
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

// Root Sagas and Reducer Imports
import rootSaga from './sagas';
import rootReducer from './reducers';

// Every thing below is a basically a magic incantation to make Redux Devtools and Redux Saga work concurrently. God help you if an update breaks it...

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(sagaMiddleware),
  )
);

sagaMiddleware.run(rootSaga);

export default store;
