import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import * as actions from './index'
import * as types from './actionTypes'
import contentfulClient from '../../contentfulClient'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
  it('should create an action to update the config', () => {
    const expectedAction = {
      type: types.SET_CONFIG,
      config: {
        mailTo: 'a@b.com',
      },
    }
    expect(actions.setConfig({ mailTo: 'a@b.com' })).toEqual(expectedAction)
  })

  it('should create an action to setup login details', () => {
    const user = { field: 'user' }
    const expectedAction = {
      type: types.SET_USER_DETAILS,
      user,
    }
    expect(actions.setUserDetails(user)).toEqual(expectedAction)
  })

  it('should create an action to toggle ts and cs', () => {
    const shouldShowTerms = true
    const expectedAction = {
      type: types.SET_TERMS_VISIBILITY,
      shouldShowTerms,
    }
    expect(actions.setTermsVisibility(shouldShowTerms)).toEqual(expectedAction)
  })

  it('should create an action to store an error', () => {
    const expectedAction = {
      type: types.SET_ERROR,
      error: 'Something went wrong',
    }
    expect(actions.setError('Something went wrong')).toEqual(expectedAction)
  })

  it('should create an action to reset the global error state', () => {
    const expectedAction = {
      type: types.RESET_ERROR,
    }
    expect(actions.resetError()).toEqual(expectedAction)
  })

  it('should create an action to store an info message', () => {
    const expectedAction = {
      type: types.SET_MESSAGE,
      message: 'Your stuff was saved.',
    }
    expect(actions.setMessage('Your stuff was saved.')).toEqual(expectedAction)
  })

  it('should create an action to update a loaded flag for rendering', () => {
    const expectedAction = {
      type: types.SET_LOADED,
      loaded: true,
    }
    expect(actions.setLoaded(true)).toEqual(expectedAction)
  })

  it('should create a validation error', () => {
    const expectedAction = {
      type: types.SET_VALIDATION_ERROR,
      fieldName: 'aField',
      message: 'a message',
    }
    expect(actions.setValidationError('aField', 'a message')).toEqual(expectedAction)
  })

  it('should clear all validation errors', () => {
    const expectedAction = {
      type: types.RESET_VALIDATION_ERRORS,
    }
    expect(actions.resetValidationErrors()).toEqual(expectedAction)
  })

  it('should create an action to set the application title', () => {
    const title = 'New Title'
    const expectedAction = {
      type: types.SET_APPLICATION_TITLE,
      title,
    }
    expect(actions.setApplicationTitle(title)).toEqual(expectedAction)
  })

  it('should create an action to save search locations', () => {
    const expectedAction = {
      type: types.SET_SEARCH_LOCATIONS,
      locations: ['loc1', 'loc2'],
    }
    expect(actions.setSearchLocations(['loc1', 'loc2'])).toEqual(expectedAction)
  })

  it('should create an action to save search activities', () => {
    const expectedAction = {
      type: types.SET_SEARCH_ACTIVITIES,
      activities: ['loc1', 'loc2'],
    }
    expect(actions.setSearchActivities(['loc1', 'loc2'])).toEqual(expectedAction)
  })

  it('should create an action to save a search location', () => {
    const expectedAction = {
      type: types.SET_SEARCH_LOCATION,
      location: 'home',
    }
    expect(actions.setSearchLocation('home')).toEqual(expectedAction)
  })

  it('should create an action to save a search activity', () => {
    const expectedAction = {
      type: types.SET_SEARCH_ACTIVITY,
      activity: 'chillin',
    }
    expect(actions.setSearchActivity('chillin')).toEqual(expectedAction)
  })

  it('should create an action to save a search date', () => {
    const expectedAction = {
      type: types.SET_SEARCH_DATE,
      date: '25/11/1976',
    }
    expect(actions.setSearchDate('25/11/1976')).toEqual(expectedAction)
  })

  it('should create an action to save the search period', () => {
    const expectedAction = {
      type: types.SET_SEARCH_PERIOD,
      period: 'brunch',
    }
    expect(actions.setSearchPeriod('brunch')).toEqual(expectedAction)
  })

  it('should create an action to save prisoners wing residence state', () => {
    const expectedAction = {
      type: types.SET_SEARCH_WING_STATUS,
      wingStatus: 'staying',
    }
    expect(actions.setSearchWingStatus('staying')).toEqual(expectedAction)
  })

  it('should create an action to save the events list data', () => {
    const expectedAction = {
      type: types.SET_HOUSEBLOCK_DATA,
      data: { stuff: 'stuff' },
    }
    expect(actions.setHouseblockData({ stuff: 'stuff' })).toEqual(expectedAction)
  })

  it('should create an action to set the events list order field', () => {
    const expectedAction = {
      type: types.SET_ORDER_FIELD,
      orderField: 'name',
    }
    expect(actions.setOrderField('name')).toEqual(expectedAction)
  })

  it('should create an action to set the events list sort order', () => {
    const expectedAction = {
      type: types.SET_ORDER,
      sortOrder: 'ASC',
    }
    expect(actions.setSortOrder('ASC')).toEqual(expectedAction)
  })

  it('should create an action to save the activity list data', () => {
    const expectedAction = {
      type: types.SET_ACTIVITY_DATA,
      data: [{ stuff: 'stuff' }],
    }
    expect(actions.setActivityData([{ stuff: 'stuff' }])).toEqual(expectedAction)
  })

  it('should create an action to set establishment roll block data', () => {
    const data = {
      movements: null,
      blocks: [],
      totals: null,
    }
    const expectedAction = {
      type: types.SET_ESTABLISHMENT_ROLL_DATA,
      data,
    }
    expect(actions.setEstablishmentRollData(data)).toEqual(expectedAction)
  })

  it('should create an action to save the global search data', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_RESULTS_DATA,
      data: [{ stuff: 'stuff' }],
    }
    expect(actions.setGlobalSearchResults([{ stuff: 'stuff' }])).toEqual(expectedAction)
  })

  it('should create an action to save the global search search text', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_TEXT,
      searchText: 'Ian',
    }
    expect(actions.setGlobalSearchText('Ian')).toEqual(expectedAction)
  })

  it('should create an action to save the global search location filter', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_LOCATION_FILTER,
      locationFilter: 'Ian',
    }
    expect(actions.setGlobalSearchLocationFilter('Ian')).toEqual(expectedAction)
  })

  it('should create an action to save the global search gender filter', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_GENDER_FILTER,
      genderFilter: 'Ian',
    }
    expect(actions.setGlobalSearchGenderFilter('Ian')).toEqual(expectedAction)
  })

  it('should create an action to save the global search dateOfBirth filter', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_DATE_OF_BIRTH_FILTER,
      dateOfBirthFilter: { isoDate: '2018-11-12', valid: true, blank: false },
    }
    expect(actions.setGlobalSearchDateOfBirthFilter({ isoDate: '2018-11-12', valid: true, blank: false })).toEqual(
      expectedAction
    )
  })

  it('should create an action to save user search page size', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_PAGINATION_PAGE_SIZE,
      pageSize: 4,
    }
    expect(actions.setGlobalSearchPageSize(4)).toEqual(expectedAction)
  })

  it('should create an action to save user search page number', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_PAGINATION_PAGE_NUMBER,
      pageNumber: 6,
    }
    expect(actions.setGlobalSearchPageNumber(6)).toEqual(expectedAction)
  })

  it('should create an action to save user search total records', () => {
    const expectedAction = {
      type: types.SET_GLOBAL_SEARCH_PAGINATION_TOTAL_RECORDS,
      totalRecords: 6,
    }
    expect(actions.setGlobalSearchTotalRecords(6)).toEqual(expectedAction)
  })

  it('should create an action to update the adjudication details', () => {
    const expectedAction = {
      type: types.SET_ADJUDICATION_DETAIL,
      detail: { establishment: 'MDI' },
    }
    expect(actions.setAdjudicationDetail({ establishment: 'MDI' })).toEqual(expectedAction)
  })

  it('should create an action to update the adjudication history filter', () => {
    const expectedAction = {
      type: types.SET_ADJUDICATION_HISTORY_FILTER,
      fields: { establishment: 'MDI' },
    }
    expect(actions.setAdjudicationHistoryFilter({ establishment: 'MDI' })).toEqual(expectedAction)
  })

  it('should create an action to update adjudication history results', () => {
    const expectedAction = {
      type: types.SET_ADJUDICATION_HISTORY_RESULTS,
      results: ['result-1'],
    }
    expect(actions.setAdjudicationHistoryResults(['result-1'])).toEqual(expectedAction)
  })

  it('should create an action to update the current page number of the adjudication history results', () => {
    const expectedAction = {
      type: types.SET_ADJUDICATION_HISTORY_PAGE_NUMBER,
      number: 6,
    }
    expect(actions.setAdjudicationHistoryPageNumber(6)).toEqual(expectedAction)
  })

  it('should create an action to update the number of adjudication history results to show', () => {
    const expectedAction = {
      type: types.SET_ADJUDICATION_HISTORY_PAGE_SIZE,
      size: 6,
    }
    expect(actions.setAdjudicationHistoryPageSize(6)).toEqual(expectedAction)
  })

  it('should create an action to set the offender', () => {
    const expectedAction = {
      type: types.SET_OFFENDER,
      offender: { firstName: 'first-name-1', lastName: 'last-name1' },
    }
    expect(actions.setOffender({ firstName: 'first-name-1', lastName: 'last-name1' })).toEqual(expectedAction)
  })

  it('should create an action to update Incentive level history results', () => {
    const expectedAction = {
      type: types.SET_IEP_HISTORY_RESULTS,
      results: ['result-1'],
    }
    expect(actions.setIepHistoryResults(['result-1'])).toEqual(expectedAction)
  })

  it('should create an action to update possible Incentive levels', () => {
    const expectedAction = {
      type: types.SET_POSSIBLE_IEP_LEVELS,
      levels: ['level-1'],
    }
    expect(actions.setPossibleIepLevels(['level-1'])).toEqual(expectedAction)
  })

  describe('content actions', () => {
    let store
    const getEntriesSpy = jest.spyOn(contentfulClient, 'getEntries')

    beforeEach(() => {
      store = mockStore({})
    })

    it('creates SET_ERROR when there is no content for specified path', async () => {
      const response = {
        items: [],
      }
      const expectedActions = [
        { type: types.SET_LOADED, loaded: false },
        { type: types.RESET_ERROR },
        { type: types.SET_ERROR, error: 'There is no content for this path.' },
        { type: types.SET_LOADED, loaded: true },
      ]

      getEntriesSpy.mockResolvedValue(response)

      return store.dispatch(actions.fetchContent()).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('creates SET_CONTENT_SUCCESS when there is content for specified path', async () => {
      const response = {
        items: [
          {
            fields: {
              title: 'Content',
              path: 'content',
              category: 'footer',
              body: 'Content body',
            },
          },
        ],
      }
      const expectedActions = [
        { type: types.SET_LOADED, loaded: false },
        { type: types.RESET_ERROR },
        { type: types.SET_CONTENT_SUCCESS, payload: response.items[0].fields },
        { type: types.SET_LOADED, loaded: true },
      ]

      getEntriesSpy.mockResolvedValue(response)

      return store.dispatch(actions.fetchContent()).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })

  it('should create an action to set an offenders activity attendance information', () => {
    const expectedAction = {
      type: types.SET_ACTIVITY_OFFENDER_ATTENDANCE,
      offenderIndex: 1,
      attendanceInfo: {
        other: true,
        absentReason: 'AcceptableAbsence',
        comments: 'Comment or case note text',
      },
    }

    expect(
      actions.setActivityOffenderAttendance(1, {
        other: true,
        absentReason: 'AcceptableAbsence',
        comments: 'Comment or case note text',
      })
    ).toEqual(expectedAction)
  })

  it('should create an action to set an offenders houseblock attendance information', () => {
    const expectedAction = {
      type: types.SET_ACTIVITY_OFFENDER_ATTENDANCE,
      offenderIndex: 1,
      attendanceInfo: {
        other: true,
        absentReason: 'AcceptableAbsence',
        comments: 'Comment or case note text',
      },
    }

    expect(
      actions.setActivityOffenderAttendance(1, {
        other: true,
        absentReason: 'AcceptableAbsence',
        comments: 'Comment or case note text',
      })
    ).toEqual(expectedAction)
  })

  describe('absent reasons actions', () => {
    let mockAxios
    let store

    beforeEach(() => {
      mockAxios = new MockAdapter(axios)
      store = mockStore()
    })

    it('creates SET_ABSENT_REASONS when getting absent reasons has completed', async () => {
      const absentReasons = [
        { value: 'AcceptableAbsence', name: 'Acceptable absence' },
        { value: 'Refused', name: 'Refused' },
      ]
      const expectedActions = [
        {
          payload: absentReasons,
          type: 'SET_ABSENT_REASONS',
        },
      ]

      mockAxios.onGet('/api/attendance/absence-reasons').reply(200, absentReasons)
      await store.dispatch(actions.getAbsentReasons())

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('creates SET_ERROR when getting absent reasons has failed', async () => {
      const expectedActions = [{ error: Error('Network Error'), type: 'SET_ERROR' }]

      mockAxios.onGet('/api/attendance/absence-reasons').networkError()
      await store.dispatch(actions.getAbsentReasons())

      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
