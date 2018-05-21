import { combineReducers } from 'redux';
import * as ActionTypes from '../actions/actionTypes';

const appInitialState = {
  config: { mailTo: '' },
  user: { activeCaseLoadId: null },
  shouldShowTerms: false,
  error: null,
  message: null,
  loaded: false
};

export function app (state = appInitialState, action) {
  switch (action.type) {
    case ActionTypes.SET_CONFIG:
      return updateObject(state, {
        config: action.config
      });
    case ActionTypes.SET_USER_DETAILS:
      return updateObject(state, {
        user: action.user
      });
    case ActionTypes.SWITCH_AGENCY:
      return { ...state, user: { ...state.user, activeCaseLoadId: action.activeCaseLoadId } };

    case ActionTypes.SET_TERMS_VISIBILITY:
      return { ...state, shouldShowTerms: action.shouldShowTerms };

    case ActionTypes.SET_ERROR:
      return updateObject(state, {
        error: action.error
      });
    case ActionTypes.RESET_ERROR:
      return updateObject(state, {
        error: null
      });
    case ActionTypes.SET_MESSAGE:
      return {
        ...state,
        message: action.message
      };
    case ActionTypes.SET_LOADED:
      return {
        ...state,
        loaded: action.loaded
      };
    case ActionTypes.SET_VALIDATION_ERROR:
      const newError = { [action.fieldName]: action.message };
      return {
        ...state,
        validationErrors: state.validationErrors ?
          { ...state.validationErrors, ...newError } :
          newError
      };
    case ActionTypes.RESET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: null
      };
    default:
      return state;
  }
}

function updateObject (oldObject, newValues) {
  return Object.assign({}, oldObject, newValues);
}


const prisonStaffHubApp = combineReducers({
  app
});

export default prisonStaffHubApp;
