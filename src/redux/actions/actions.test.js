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

  it('should create an action to save search locations', () => {
    const expectedAction = {
      type: types.SET_SEARCH_LOCATIONS,
      locations: ['loc1', 'loc2']
    };
    expect(actions.setSearchLocations(['loc1', 'loc2'])).toEqual(expectedAction);
  });

  it('should create an action to save search activities', () => {
    const expectedAction = {
      type: types.SET_SEARCH_ACTIVITIES,
      activities: ['loc1', 'loc2']
    };
    expect(actions.setSearchActivities(['loc1', 'loc2'])).toEqual(expectedAction);
  });

  it('should create an action to save a search location', () => {
    const expectedAction = {
      type: types.SET_SEARCH_LOCATION,
      location: 'home'
    };
    expect(actions.setSearchLocation('home')).toEqual(expectedAction);
  });

  it('should create an action to save a search activity', () => {
    const expectedAction = {
      type: types.SET_SEARCH_ACTIVITY,
      activity: 'chillin'
    };
    expect(actions.setSearchActivity('chillin')).toEqual(expectedAction);
  });

  it('should create an action to save a search date', () => {
    const expectedAction = {
      type: types.SET_SEARCH_DATE,
      date: '25/11/1976'
    };
    expect(actions.setSearchDate('25/11/1976')).toEqual(expectedAction);
  });

  it('should create an action to save the search period', () => {
    const expectedAction = {
      type: types.SET_SEARCH_PERIOD,
      period: 'brunch'
    };
    expect(actions.setSearchPeriod('brunch')).toEqual(expectedAction);
  });

  it('should create an action to save the houseblock list data', () => {
    const expectedAction = {
      type: types.SET_HOUSEBLOCK_DATA,
      data: { stuff: 'stuff' }
    };
    expect(actions.setHouseblockData({ stuff: 'stuff' })).toEqual(expectedAction);
  });

  it('should create an action to set the houseblock list order', () => {
    const expectedAction = {
      type: types.SET_HOUSEBLOCK_ORDER,
      orderField: 'name'
    };
    expect(actions.setHouseblockOrder('name')).toEqual(expectedAction);
  });
});
