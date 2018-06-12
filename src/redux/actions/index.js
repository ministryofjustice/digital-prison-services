import * as ActionTypes from './actionTypes';

export const setConfig = (config) => {
  return {
    type: ActionTypes.SET_CONFIG,
    config: config
  };
};

export const setUserDetails = (user) => {
  return {
    type: ActionTypes.SET_USER_DETAILS,
    user
  };
};

export const switchAgency = (agencyId) => {
  return {
    type: ActionTypes.SWITCH_AGENCY,
    activeCaseLoadId: agencyId
  };
};

export const setTermsVisibility = (shouldShowTerms) => ({
  type: ActionTypes.SET_TERMS_VISIBILITY,
  shouldShowTerms
});


export const setError = (error) => {
  return {
    type: ActionTypes.SET_ERROR,
    error
  };
};

export const resetError = (error) => {
  return {
    type: ActionTypes.RESET_ERROR
  };
};

export const setMessage = (message) => {
  return {
    type: ActionTypes.SET_MESSAGE,
    message
  };
};

export const setLoaded = (loaded) => {
  return {
    type: ActionTypes.SET_LOADED,
    loaded
  };
};

export const setValidationError = (fieldName, message) => {
  return {
    type: ActionTypes.SET_VALIDATION_ERROR,
    fieldName,
    message
  };
};

export const resetValidationErrors = (fieldName, message) => {
  return {
    type: ActionTypes.RESET_VALIDATION_ERRORS
  };
};

export const setSearchLocations = (locations) => {
  return {
    type: ActionTypes.SET_SEARCH_LOCATIONS,
    locations
  };
};

export const setSearchActivities = (activities) => {
  return {
    type: ActionTypes.SET_SEARCH_ACTIVITIES,
    activities
  };
};

export const setSearchLocation = (location) => {
  return {
    type: ActionTypes.SET_SEARCH_LOCATION,
    location
  };
};

export const setSearchActivity = (activity) => {
  return {
    type: ActionTypes.SET_SEARCH_ACTIVITY,
    activity
  };
};

export const setSearchDate = (date) => {
  return {
    type: ActionTypes.SET_SEARCH_DATE,
    date
  };
};

export const setSearchPeriod = (period) => {
  return {
    type: ActionTypes.SET_SEARCH_PERIOD,
    period
  };
};

export const setHouseblockData = (data) => {
  return {
    type: ActionTypes.SET_HOUSEBLOCK_DATA,
    data
  };
};

export const setHouseblockOrderField = (orderField) => {
  return {
    type: ActionTypes.SET_HOUSEBLOCK_ORDER_FIELD,
    orderField
  };
};

export const setHouseblockSortOrder = (sortOrder) => {
  return {
    type: ActionTypes.SET_HOUSEBLOCK_SORT_ORDER,
    sortOrder
  };
};
