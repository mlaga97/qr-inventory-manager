// Library imports
import { combineReducers } from 'redux';

// Reducers
const rootReducer = combineReducers({
  lastScannedUUID: function(state = null, action) {
    switch (action.type) {
      //case 'UUID_SCANNED':
      //  return action.data;
      case 'UUID_SELECTED':
        return action.data;
      case 'CLEAR_UUID_QUEUE':
        return null;
      default:
        return state;
    }
  },
  lastSelectedUUID: function(state = null, action) {
    switch (action.type) {
      //case 'UUID_SCANNED':
      //  return action.data;
      case 'UUID_SELECTED':
        return action.data;
      case 'CLEAR_UUID_QUEUE':
        return null;
      default:
        return state;
    }
  },
  scannedUUIDqueue: function(state = {}, action) {
    switch (action.type) {
      case 'UUID_SELECTED':
        return Object.assign({}, state, {
          [action.data]: new Date(),
        });
      case 'CLEAR_UUID_QUEUE':
        return {};
      default:
        return state;
    }
  },
  tags: function(state = {}, action) {
    switch (action.type) {
      case 'GET_TAGS_SUCCEEDED':
        return action.data;
      //case 'REPLACE_UUID_SUCCEEDED':
      //  return ({[action.data.fromUUID]: _, ...newState}) => ({newState});
      default:
        return state;
    }
  },
  auth: function(state = true, action) {
    switch (action.type) {
      case 'GET_TAGS_FAILED':
        if (action.error.message === 'Request failed with status code 403')
          return false;

        // TODO: Better...
      case 'GET_TAGS_SUCCEEDED':
        return true;
      default:
        return state;
    }
  },
});

export default rootReducer;
