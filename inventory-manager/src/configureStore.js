// Library imports
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
//import composeWithDevTools from 'redux-devtools-extension';
import { all, takeEvery, takeLatest, call, put } from 'redux-saga/effects';

import PouchDB from 'pouchdb';

// TODO: This is probably a memory leak or something
function getDB() {
  const url = localStorage.getItem('dbURL');
  const user = localStorage.getItem('dbUser');
  const pass = localStorage.getItem('dbPass');

  const db = new PouchDB(url, {
    auth: {
      username: user,
      password: pass,
    }
  });

  return db;
}

function getAPI() {
  const api = new PouchDB('https://couchdb.mlaga97.space/uuid-inventory-api');

  return api;
}

// TODO: USE THIS!
const FixColumns = (i) => {
  if (!Object.prototype.hasOwnProperty.call(i, 'label'))
    i.label = '';

  if (!Object.prototype.hasOwnProperty.call(i, 'labelPrinted'))
    i.labelPrinted = false;

  if (!Object.prototype.hasOwnProperty.call(i, 'location'))
    i.location = '';

  // TODO: Split in twain
  if (!Object.prototype.hasOwnProperty.call(i, 'containerMakeModel'))
    i.containerMakeModel = 'Unknown';

  if (!Object.prototype.hasOwnProperty.call(i, 'comments'))
    i.comments = 'Unknown';

  return i;
}

function* testSaga() {
  try {
    const response = yield call(getDB().allDocs, {include_docs: true});

    yield put({type: 'DB_UPDATE_SUCCEEDED', data: response});
  } catch(e) {
    yield put({type: 'DB_UPDATE_FAILED', error: e});
  }
}

function* commitUUIDSaga(action) {
  try {
    const response = yield call(getDB().bulkDocs, action.data);
    yield put({type: 'COMMIT_UUIDS_SUCCEEDED', data: response});
    yield put({type: 'DB_UPDATE_REQUESTED'}); // TODO: Update Better
  } catch(e) {
    yield put({type: 'COMMIT_UUIDS_FAILED', error: e});
  }
}

function* replaceUUIDSaga(action) {
  try {
    const { fromUUID, toUUID } = action.data;

    const oldDoc = yield call(getDB().get, fromUUID);

    // Create the new doc
    let newDoc = {...oldDoc, _id: toUUID};
    delete newDoc._rev;
    //const update = '';
    const update = yield call(getDB().put, newDoc);
    const remove = yield call(getDB().remove, oldDoc);

    console.log(update);
    console.log(remove);

    yield put({type: 'REPLACE_UUID_SUCCEEDED', data: {fromUUID, toUUID, update, remove}});
    yield put({type: 'DB_UPDATE_REQUESTED'}); // TODO: Update Better
  } catch(e) {
    yield put({type: 'REPLACE_UUID_FAILED', error: e});
  }
}

function* test() {
  yield takeEvery('DB_UPDATE_REQUESTED', testSaga);
  yield takeEvery('COMMIT_UUIDS_REQUESTED', commitUUIDSaga);
  yield takeEvery('REPLACE_UUID_REQUESTED', replaceUUIDSaga);
}

// Sagas
function* rootSaga() {
  yield all(
    [
      test(),
    ]
  );
}

// Reducers
const rootReducer = combineReducers({
  lastScannedUUID: function(state = null, action) {
    switch (action.type) {
      case 'UUID_SCANNED':
        return action.data;
      case 'CLEAR_UUID_QUEUE':
        return null;
      default:
        return state;
    }
  },
  scannedUUIDqueue: function(state = {}, action) {
    switch (action.type) {
      case 'UUID_SCANNED':
        return Object.assign({}, state, {
          [action.data]: new Date(),
        });
      case 'CLEAR_UUID_QUEUE':
        return {};
      default:
        return state;
    }
  },
  cachedDBentries: function(state = {}, action) {
    switch (action.type) {
      case 'DB_UPDATE_SUCCEEDED':
        let newData = {};
        action.data.rows.map((row) => newData[row.id] = row.doc);
        return Object.assign({}, state, newData);
      case 'REPLACE_UUID_SUCCEEDED':
        return ({[action.data.fromUUID]: _, ...newState}) => ({newState});
      default:
        return state;
    }
  },
  auth: function(state = true, action) {
    switch (action.type) {
      case 'DB_UPDATE_FAILED':
        if (action.error.reason === "Name or password is incorrect.")
          return false;

        // TODO: Do something better here...
        return false;
      case 'DB_UPDATE_SUCCEEDED':
        return true;
      default:
        return state;
    }
  },
});

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
