// Library imports
import { all, takeEvery, call, put } from 'redux-saga/effects';
import axios from 'axios';
import PouchDB from 'pouchdb';

// TODO: Actually *perform* normalization
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

// TODO: This is probably (read: definitely) a memory leak or something
// TODO: Handle globally with a singleton or equivalent construct
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

// Obviously, dumping the entire database constantly isn't the correct solution long-term.
// However, that is harder to do and this should scale fine up to thousands of items or more.
// TODO: Not this
function* dbUpdateSaga() {
  try {
    const response = yield call(getDB().allDocs, {include_docs: true});

    yield put({type: 'DB_UPDATE_SUCCEEDED', data: response});
  } catch(e) {
    yield put({type: 'DB_UPDATE_FAILED', error: e});
  }
}

// This provides absolutely no useful feedback in the case that something goes wrong and has
// exactly zero verification either on the API side or on the UI side to indicate a problem.
//
// Example: If a record is updated in the DB after it is pulled and then an update is attempted,
//          it just breaks silently, and the method to recover (refresh the page) is unclear at best,
//          and causes data loss at worst.
//
// Another thing is that a full and complete db update is an absolutely ridiculous thing to do here.
function* commitUUIDSaga(action) {
  try {
    const response = yield call(getDB().bulkDocs, action.data);
    yield put({type: 'COMMIT_UUIDS_SUCCEEDED', data: response});
    yield put({type: 'DB_UPDATE_REQUESTED'}); // TODO: Update Better
  } catch(e) {
    yield put({type: 'COMMIT_UUIDS_FAILED', error: e});
  }
}

// This is more or less bound to end up failing halfway in-between updating and removing at some point
// In theory, this should only result in a duplicate of a tag that is about to be thrown away, but
// the good lord Murphy knows that it will eventually result in a data or two getting lost.
// TODO: Better
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

function* getTags(action) {
  try {
    const response = yield call(() => axios.get('https://inventory.mlaga97.space/api/v1/tags', {headers: {'api-key': localStorage.getItem('dbPass')}}));

    yield put({
      type: 'GET_TAGS_SUCCEEDED',
      data: response.data,
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: 'GET_TAGS_FAILED',
      error: e,
    });
  }
}

function* postTags(action) {
  try {
    const response = yield call(() => axios.put('https://inventory.mlaga97.space/api/v1/tags', action.data, {
      headers: {
        'api-key': localStorage.getItem('dbPass'),
      }
    }));

    yield put({type: 'GET_TAGS_REQUESTED'});
    yield put({type: 'POST_TAGS_SUCCEEDED'});
  } catch (e) {
    yield put({
      type: 'POST_TAGS_FAILED',
      error: e,
    });
  }
}

function* scanTag(action) {
  try {
    // TODO: Re-enable scanning API
    const response = yield call(() => axios.put('https://inventory.mlaga97.space/api/v1/scan/' + action.data, null, {
      headers: {
        'api-key': localStorage.getItem('dbPass'),
      }
    }));

    yield put({type: 'UUID_SCAN_SUCCEEDED'});
  } catch (e) {
    yield put({
      type: 'UUID_SCAN_FAILED',
      error: e,
    });
  }
}

function* replaceTag(action) {
  try {
    const response = yield call(() => axios.put('https://inventory.mlaga97.space/api/v1/replace/' + action.data.fromUUID, action.data.toUUID, {
      headers: {
        'api-key': localStorage.getItem('dbPass'),
      }
    }));

    yield put({type: 'GET_TAGS_REQUESTED'});
    yield put({type: 'REPLACE_TAG_SUCCEEDED'});
  } catch (e) {
    yield put({
      type: 'REPLACE_TAG_FAILED',
      error: e,
    });
  }
}

// Root Saga
export default function* rootSaga() {
  //yield takeEvery('DB_UPDATE_REQUESTED', dbUpdateSaga);
  //yield takeEvery('COMMIT_UUIDS_REQUESTED', commitUUIDSaga);
  //yield takeEvery('REPLACE_UUID_REQUESTED', replaceUUIDSaga);

  yield takeEvery('UUID_SCANNED', scanTag);
  yield takeEvery('GET_TAGS_REQUESTED', getTags);
  yield takeEvery('POST_TAGS_REQUESTED', postTags);
  //yield takeEvery('REPLACE_TAG_REQUESTED', replaceTag);
}
