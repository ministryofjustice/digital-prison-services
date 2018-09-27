import { combineReducers } from 'redux';
import * as ActionTypes from '../actions/actionTypes';
import moment from 'moment';

export function defaultPeriod (time) {
  const midnight = moment('12:00a', "HH:mm a");
  const midday = moment('12:00p', "HH:mm a");
  const evening = moment('17:00p', "HH:mm a");

  const isMorning = time.isBetween(midnight, midday, null, '[)');
  const isAfternoon = time.isBetween(midday, evening, null, '[)');

  if (isMorning) {
    return 'AM';
  } else if (isAfternoon) {
    return 'PM';
  }
  return 'ED';
}


const appInitialState = {
  config: { mailTo: '' },
  user: { activeCaseLoadId: null },
  shouldShowTerms: false,
  error: null,
  message: null,
  loaded: false,
  menuOpen: false,
  showModal: {}
};

const searchInitialState = {
  locations: [],
  activities: [''],
  location: '',
  subLocation: '--',
  activity: '',
  date: 'Today',
  period: defaultPeriod(moment())
};

const eventsInitialState = {
  houseBlockData: [],
  activityData: [],
  orderField: 'cellLocation',
  sortOrder: 'ASC'
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
    case ActionTypes.SET_SHOW_MODAL:
      return {
        ...state,
        showModal: action.payload
      };
    case ActionTypes.SET_MENU_OPEN:
      return {
        ...state,
        menuOpen: action.payload
      };
    default:
      return state;
  }
}

export function search (state = searchInitialState, action) {
  switch (action.type) {
    case ActionTypes.SET_OFFENDER_SEARCH_ALLOCATION_STATUS:
      return {
        ...state,
        allocationStatus: action.allocationStatus
      };
    case ActionTypes.SET_SEARCH_LOCATIONS:
      return {
        ...state,
        locations: action.locations,
        location: '--',
        subLocation: '--'
      };
    case ActionTypes.SET_SEARCH_LOCATION:
      return {
        ...state,
        location: action.location,
        subLocation: '--'
      };
    case ActionTypes.SET_SEARCH_SUB_LOCATION:
      return {
        ...state,
        subLocation: action.subLocation
      };
    case ActionTypes.SET_SEARCH_ACTIVITY:
      return { ...state,
        activity: action.activity
      };
    case ActionTypes.SET_SEARCH_ACTIVITIES:
      return {
        ...state,
        activities: action.activities
      };
    case ActionTypes.SET_SEARCH_DATE:
      return {
        ...state,
        date: action.date
      };
    case ActionTypes.SET_SEARCH_PERIOD:
      return {
        ...state,
        period: action.period
      };
    default:
      return state;
  }
}

export function events (state = eventsInitialState, action) {
  switch (action.type) {
    case ActionTypes.SET_HOUSEBLOCK_DATA:
      return { ...state,
        houseBlockData: action.data
      };
    case ActionTypes.SET_ORDER_FIELD:
      return { ...state,
        orderField: action.orderField
      };
    case ActionTypes.SET_ORDER:
      return { ...state,
        sortOrder: action.sortOrder
      };
    case ActionTypes.SET_ACTIVITY_DATA:
      return { ...state,
        activityData: action.data
      };
    default:
      return state;
  }
}

function updateObject (oldObject, newValues) {
  return Object.assign({}, oldObject, newValues);
}


const prisonStaffHubApp = combineReducers({
  events, app, search
});

export default prisonStaffHubApp;
