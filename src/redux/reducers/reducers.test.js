import { app } from './index';
import * as types from '../actions/actionTypes';

const appInitialState = {
  error: null,
  message: null,
  loaded: false
};

const appWithErrorState = {
  error: 'There was a problem',
  message: null,
  loaded: false
};

const appWithValidationErrorState = {
  validationErrors: { myField: 'An error!' }
};

describe('app (global) reducer', () => {
  it('should return the initial state', () => {
    expect(app(undefined, {})).toEqual(
      {
        config: { mailTo: '' },
        user: { activeCaseLoadId: null },
        shouldShowTerms: false,
        error: null,
        message: null,
        loaded: false
      }
    );
  });

  it('should handle SET_CONFIG', () => {
    expect(
      app(appInitialState, {
        type: types.SET_CONFIG,
        config: { mailTo: 'a@b.com' }
      })
    ).toEqual(
      {
        error: null,
        message: null,
        config: { mailTo: 'a@b.com' },
        loaded: false
      });
  });

  it('should handle SET_USER_DETAILS', () => {
    expect(
      app(appInitialState, {
        type: types.SET_USER_DETAILS,
        user: { field: 'value' }
      })
    ).toEqual(
      {
        error: null,
        message: null,
        user: { field: 'value' },
        loaded: false
      }
    );
  });

  it('should handle SWITCH_AGENCY', () => {
    expect(
      app(appInitialState, {
        type: types.SWITCH_AGENCY,
        activeCaseLoadId: 'BXI'
      })
    ).toEqual(
      {
        error: null,
        message: null,
        user: { activeCaseLoadId: 'BXI' },
        loaded: false
      }
    );
  });

  it('should handle SET_TERMS_VISIBILITY', () => {
    expect(
      app(appInitialState, {
        type: types.SET_TERMS_VISIBILITY,
        shouldShowTerms: true
      })
    ).toEqual(
      {
        error: null,
        message: null,
        shouldShowTerms: true,
        loaded: false
      }
    );
  });


  it('should handle SET_ERROR', () => {
    expect(
      app(appInitialState, {
        type: types.SET_ERROR,
        error: 'HELP!'
      })
    ).toEqual(
      {
        error: 'HELP!',
        message: null,
        loaded: false
      }
    );
  });

  it('should handle RESET_ERROR', () => {
    expect(
      app(appWithErrorState, {
        type: types.RESET_ERROR
      })
    ).toEqual(
      {
        error: null,
        message: null,
        loaded: false
      }
    );
  });

  it('should handle SET_MESSAGE', () => {
    expect(
      app(appInitialState, {
        type: types.SET_MESSAGE,
        message: 'An important message!'
      })
    ).toEqual(
      {
        error: null,
        message: 'An important message!',
        loaded: false
      }
    );
  });

  it('should handle SET_LOADED', () => {
    expect(
      app(appInitialState, {
        type: types.SET_LOADED,
        loaded: true
      })
    ).toEqual(
      {
        error: null,
        message: null,
        loaded: true
      }
    );
  });

  it('should handle SET_VALIDATION_ERROR (first error)', () => {
    expect(
      app(appInitialState, {
        type: types.SET_VALIDATION_ERROR,
        fieldName: 'myField',
        message: 'An error!'
      })
    ).toEqual(
      {
        error: null,
        message: null,
        loaded: false,
        validationErrors: { myField: 'An error!' }
      }
    );
  });

  it('should handle SET_VALIDATION_ERROR (second error)', () => {
    expect(
      app(appWithValidationErrorState, {
        type: types.SET_VALIDATION_ERROR,
        fieldName: 'myField2',
        message: 'Another error!'
      })
    ).toEqual(
      {
        validationErrors: {
          myField: 'An error!',
          myField2: 'Another error!'
        }
      }
    );
  });

  it('should handle RESET_VALIDATION_ERRORS', () => {
    expect(
      app(appWithValidationErrorState, {
        type: types.RESET_VALIDATION_ERRORS
      })
    ).toEqual(
      {
        validationErrors: null
      }
    );
  });
});

