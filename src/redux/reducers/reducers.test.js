import moment from 'moment'
import { app, search, defaultPeriod, events, establishmentRoll, globalSearch } from './index'
import * as types from '../actions/actionTypes'
import { setMenuOpen } from '../actions'

const appInitialState = {
  caseChangeRedirect: true,
  error: '',
  message: null,
  loaded: false,
  title: 'Activity Lists',
}

const appWithErrorState = {
  error: 'There was a problem',
  message: null,
  loaded: false,
}

const searchInitialState = {
  locations: [],
  activities: [],
  location: '',
  activity: '',
  date: moment().format('DD/MM/YYYY'),
  period: '',
}

const establishmentRollInitialState = {
  movements: [],
  blocks: [],
  totals: null,
}

const appWithValidationErrorState = {
  validationErrors: { myField: 'An error!' },
}

const pagingInitialState = {
  pageNumber: 0,
  pageSize: 10,
  totalRecords: 0,
}

describe('app (global) reducer', () => {
  it('should return the initial state', () => {
    expect(app(undefined, {})).toEqual({
      caseChangeRedirect: true,
      config: { mailTo: '' },
      user: { activeCaseLoadId: null },
      shouldShowTerms: false,
      error: '',
      message: null,
      loaded: false,
      menuOpen: false,
      showModal: {},
      title: 'Activity Lists',
    })
  })

  it('should handle SET_CONFIG', () => {
    expect(
      app(appInitialState, {
        type: types.SET_CONFIG,
        config: { mailTo: 'a@b.com' },
      })
    ).toEqual({
      ...appInitialState,
      config: { mailTo: 'a@b.com' },
    })
  })

  it('should handle SET_USER_DETAILS', () => {
    expect(
      app(appInitialState, {
        type: types.SET_USER_DETAILS,
        user: { field: 'value' },
      })
    ).toEqual({
      ...appInitialState,
      user: { field: 'value' },
    })
  })

  it('should handle SWITCH_AGENCY', () => {
    expect(
      app(appInitialState, {
        type: types.SWITCH_AGENCY,
        activeCaseLoadId: 'BXI',
      })
    ).toEqual({
      ...appInitialState,
      user: { activeCaseLoadId: 'BXI' },
    })
  })

  it('should handle SET_TERMS_VISIBILITY', () => {
    expect(
      app(appInitialState, {
        type: types.SET_TERMS_VISIBILITY,
        shouldShowTerms: true,
      })
    ).toEqual({
      ...appInitialState,
      shouldShowTerms: true,
    })
  })

  it('should handle SET_ERROR', () => {
    expect(
      app(appInitialState, {
        type: types.SET_ERROR,
        error: 'HELP!',
      })
    ).toEqual({
      ...appInitialState,
      error: 'HELP!',
    })
  })

  it('should handle RESET_ERROR', () => {
    expect(
      app(appWithErrorState, {
        type: types.RESET_ERROR,
      })
    ).toEqual({
      ...appWithErrorState,
      error: '',
    })
  })

  it('should handle SET_MESSAGE', () => {
    expect(
      app(appInitialState, {
        type: types.SET_MESSAGE,
        message: 'An important message!',
      })
    ).toEqual({
      ...appInitialState,
      message: 'An important message!',
    })
  })

  it('should handle SET_LOADED', () => {
    expect(
      app(appInitialState, {
        type: types.SET_LOADED,
        loaded: true,
      })
    ).toEqual({
      ...appInitialState,
      loaded: true,
    })
  })

  it('should handle SET_VALIDATION_ERROR (first error)', () => {
    expect(
      app(appInitialState, {
        type: types.SET_VALIDATION_ERROR,
        fieldName: 'myField',
        message: 'An error!',
      })
    ).toEqual({
      ...appInitialState,
      validationErrors: { myField: 'An error!' },
    })
  })

  it('should handle SET_VALIDATION_ERROR (second error)', () => {
    expect(
      app(appWithValidationErrorState, {
        type: types.SET_VALIDATION_ERROR,
        fieldName: 'myField2',
        message: 'Another error!',
      })
    ).toEqual({
      validationErrors: {
        myField: 'An error!',
        myField2: 'Another error!',
      },
    })
  })

  it('should handle RESET_VALIDATION_ERRORS', () => {
    expect(
      app(appWithValidationErrorState, {
        type: types.RESET_VALIDATION_ERRORS,
      })
    ).toEqual({
      validationErrors: null,
    })
  })

  it('should handle SET_APPLICATION_TITLE', () => {
    expect(
      app(appInitialState, {
        type: types.SET_APPLICATION_TITLE,
        title: 'New Title',
      })
    ).toEqual({
      caseChangeRedirect: true,
      error: '',
      message: null,
      loaded: false,
      title: 'New Title',
    })
  })

  it('should handle SET_SEARCH_LOCATIONS', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_LOCATIONS,
        locations: ['a', 'b'],
      })
    ).toEqual({
      ...searchInitialState,
      locations: ['a', 'b'],
      location: '--',
      subLocation: '--',
    })
  })

  it('should handle SET_SEARCH_LOCATION', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_LOCATION,
        location: 'lol',
      })
    ).toEqual({
      ...searchInitialState,
      location: 'lol',
      subLocation: '--',
    })
  })

  it('should handle SET_SEARCH_SUB_LOCATION', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_SUB_LOCATION,
        subLocation: 'lollol',
      })
    ).toEqual({
      ...searchInitialState,
      subLocation: 'lollol',
    })
  })

  it('should handle SET_SEARCH_ACTIVITIES', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_ACTIVITIES,
        activities: ['a', 'b'],
      })
    ).toEqual({
      ...searchInitialState,
      activities: ['a', 'b'],
    })
  })

  it('should handle SET_SEARCH_ACTIVITY', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_ACTIVITY,
        activity: 'lol',
      })
    ).toEqual({
      ...searchInitialState,
      activity: 'lol',
    })
  })

  it('should handle SET_SEARCH_DATE', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_DATE,
        date: '12/12/1999',
      })
    ).toEqual({
      ...searchInitialState,
      date: '12/12/1999',
    })
  })

  it('should handle SET_SEARCH_PERIOD', () => {
    expect(
      search(searchInitialState, {
        type: types.SET_SEARCH_PERIOD,
        period: 'teatime',
      })
    ).toEqual({
      ...searchInitialState,
      period: 'teatime',
    })
  })

  it('should handle SET_HOUSEBLOCK_DATA', () => {
    expect(
      events(undefined, {
        type: types.SET_HOUSEBLOCK_DATA,
        data: ['data0', 'data1'],
      })
    ).toEqual({
      activityData: [],
      houseBlockData: ['data0', 'data1'],
      orderField: 'cellLocation',
      sortOrder: 'ASC',
    })
  })

  it('should handle SET_ORDER_FIELD', () => {
    expect(
      events(undefined, {
        type: types.SET_ORDER_FIELD,
        orderField: 'field1',
      })
    ).toEqual({
      activityData: [],
      houseBlockData: [],
      orderField: 'field1',
      sortOrder: 'ASC',
    })
  })

  it('should handle SET_ORDER', () => {
    expect(
      events(undefined, {
        type: types.SET_ORDER,
        sortOrder: 'DESC',
      })
    ).toEqual({
      houseBlockData: [],
      activityData: [],
      orderField: 'cellLocation',
      sortOrder: 'DESC',
    })
  })

  it('should calculate current time period', () => {
    expect(defaultPeriod(moment('12:00 am', 'HH:mm a'))).toEqual('AM')
    expect(defaultPeriod(moment('12:01 am', 'HH:mm a'))).toEqual('AM')
    expect(defaultPeriod(moment('11:59:59 am', 'HH:mm:ss a'))).toEqual('AM')
    expect(defaultPeriod(moment('12:00:00 pm', 'HH:mm:ss a'))).toEqual('PM')
    expect(defaultPeriod(moment('16:59:59 pm', 'HH:mm:ss a'))).toEqual('PM')
    expect(defaultPeriod(moment('17:00:00 pm', 'HH:mm:ss a'))).toEqual('ED')
    expect(defaultPeriod(moment('11:59:59 pm', 'HH:mm:ss a'))).toEqual('ED')
  })

  it('should handle SET_MENU_OPEN', () => {
    let state = app(appInitialState, setMenuOpen(true))

    expect(state.menuOpen).toBe(true)

    state = app(appInitialState, setMenuOpen(false))

    expect(state.menuOpen).toBe(false)
  })

  it('should handle SET_ESTABLISHMENT_ROLL_DATA', () => {
    expect(
      establishmentRoll(establishmentRollInitialState, {
        type: types.SET_ESTABLISHMENT_ROLL_DATA,
        data: {
          movements: null,
          blocks: [],
          totals: null,
        },
      })
    ).toEqual({
      movements: null,
      blocks: [],
      totals: null,
    })
  })

  it('should handle SET_GLOBAL_SEARCH_RESULTS_DATA', () => {
    expect(
      globalSearch(undefined, {
        type: types.SET_GLOBAL_SEARCH_RESULTS_DATA,
        data: ['data0', 'data1'],
      })
    ).toEqual({
      ...pagingInitialState,
      contextUser: {},
      searchText: '',
      locationFilter: 'ALL',
      genderFilter: 'ALL',
      data: ['data0', 'data1'],
    })
  })

  it('should handle SET_GLOBAL_SEARCH_SEARCH_TEXT', () => {
    expect(
      globalSearch(undefined, {
        type: types.SET_GLOBAL_SEARCH_TEXT,
        searchText: 'hello',
      })
    ).toEqual({
      ...pagingInitialState,
      contextUser: {},
      searchText: 'hello',
      locationFilter: 'ALL',
      genderFilter: 'ALL',
      data: [],
    })
  })

  it('should handle SET_GLOBAL_SEARCH_LOCATION_FILTER', () => {
    expect(
      globalSearch(undefined, {
        type: types.SET_GLOBAL_SEARCH_LOCATION_FILTER,
        locationFilter: 'MDI',
      })
    ).toEqual({
      ...pagingInitialState,
      contextUser: {},
      searchText: '',
      locationFilter: 'MDI',
      genderFilter: 'ALL',
      data: [],
    })
  })

  it('should handle SET_GLOBAL_SEARCH_GENDER_FILTER', () => {
    expect(
      globalSearch(undefined, {
        type: types.SET_GLOBAL_SEARCH_GENDER_FILTER,
        genderFilter: 'F',
      })
    ).toEqual({
      ...pagingInitialState,
      contextUser: {},
      searchText: '',
      locationFilter: 'ALL',
      genderFilter: 'F',
      data: [],
    })
  })

  it('should handle SET_GLOBAL_SEARCH_PAGINATION_PAGE_SIZE', () => {
    const expectedState = pagingInitialState
    expectedState.pageSize = 5
    expect(
      globalSearch(pagingInitialState, {
        type: types.SET_GLOBAL_SEARCH_PAGINATION_PAGE_SIZE,
        pageSize: 5,
      })
    ).toEqual(expectedState)
  })

  it('should handle SET_GLOBAL_SEARCH_PAGINATION_PAGE_NUMBER', () => {
    const expectedState = pagingInitialState
    expectedState.pageNumber = 5
    expect(
      globalSearch(pagingInitialState, {
        type: types.SET_GLOBAL_SEARCH_PAGINATION_PAGE_NUMBER,
        pageNumber: 5,
      })
    ).toEqual(expectedState)
  })

  it('should handle SET_GLOBAL_SEARCH_PAGINATION_TOTAL_RECORDS', () => {
    const expectedState = pagingInitialState
    expectedState.totalRecords = 5
    expect(
      globalSearch(pagingInitialState, {
        type: types.SET_GLOBAL_SEARCH_PAGINATION_TOTAL_RECORDS,
        totalRecords: 5,
      })
    ).toEqual(expectedState)
  })
})
