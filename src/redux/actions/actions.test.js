import * as actions from './index';
import * as types from './actionTypes';

describe('actions', () => {
  it('should create an action to update the config', () => {
    const expectedAction = {
      type: types.SET_CONFIG,
      config: {
        mailTo: 'a@b.com'
      }
    };
    expect(actions.setConfig({ mailTo: 'a@b.com' })).toEqual(expectedAction);
  });

  it('should create an action to setup login details', () => {
    const user = { field: 'user' };
    const expectedAction = {
      type: types.SET_USER_DETAILS,
      user
    };
    expect(actions.setUserDetails(user)).toEqual(expectedAction);
  });

  it('should create an action to switch current Agency', () => {
    const activeCaseLoadId = 'LEI';
    const expectedAction = {
      type: types.SWITCH_AGENCY,
      activeCaseLoadId
    };
    expect(actions.switchAgency(activeCaseLoadId)).toEqual(expectedAction);
  });

  it('should create an action to toggle ts and cs', () => {
    const shouldShowTerms = true;
    const expectedAction = {
      type: types.SET_TERMS_VISIBILITY,
      shouldShowTerms
    };
    expect(actions.setTermsVisibility(shouldShowTerms)).toEqual(expectedAction);
  });

  it('should create an action to store an error', () => {
    const expectedAction = {
      type: types.SET_ERROR,
      error: 'Something went wrong'
    };
    expect(actions.setError('Something went wrong')).toEqual(expectedAction);
  });

  it('should create an action to reset the global error state', () => {
    const expectedAction = {
      type: types.RESET_ERROR
    };
    expect(actions.resetError()).toEqual(expectedAction);
  });

  it('should create an action to store an info message', () => {
    const expectedAction = {
      type: types.SET_MESSAGE,
      message: 'Your stuff was saved.'
    };
    expect(actions.setMessage('Your stuff was saved.')).toEqual(expectedAction);
  });

  it('should create an action to update a loaded flag for rendering', () => {
    const expectedAction = {
      type: types.SET_LOADED,
      loaded: true
    };
    expect(actions.setLoaded(true)).toEqual(expectedAction);
  });

  it('should create a validation error', () => {
    const expectedAction = {
      type: types.SET_VALIDATION_ERROR,
      fieldName: 'aField',
      message: 'a message'
    };
    expect(actions.setValidationError('aField', 'a message')).toEqual(expectedAction);
  });

  it('should clear all validation errors', () => {
    const expectedAction = {
      type: types.RESET_VALIDATION_ERRORS
    };
    expect(actions.resetValidationErrors()).toEqual(expectedAction);
  });
});

