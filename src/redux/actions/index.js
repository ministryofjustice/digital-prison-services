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

