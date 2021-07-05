// Library imports
import { combineReducers } from 'redux';

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

export default rootReducer;
