import * as ActionTypes from './actionTypes'
import contentfulClient from '../../contentfulClient'

export const setConfig = config => ({
  type: ActionTypes.SET_CONFIG,
  config,
})

export const setUserDetails = user => ({
  type: ActionTypes.SET_USER_DETAILS,
  user,
})

export const switchAgency = agencyId => ({
  type: ActionTypes.SWITCH_AGENCY,
  activeCaseLoadId: agencyId,
})

export const setTermsVisibility = shouldShowTerms => ({
  type: ActionTypes.SET_TERMS_VISIBILITY,
  shouldShowTerms,
})

export const setError = error => ({
  type: ActionTypes.SET_ERROR,
  error,
})

export const resetError = error => ({
  type: ActionTypes.RESET_ERROR,
})

export const setMessage = message => ({
  type: ActionTypes.SET_MESSAGE,
  message,
})

export const setLoaded = loaded => ({
  type: ActionTypes.SET_LOADED,
  loaded,
})

export const setValidationError = (fieldName, message) => ({
  type: ActionTypes.SET_VALIDATION_ERROR,
  fieldName,
  message,
})

export const resetValidationErrors = () => ({
  type: ActionTypes.RESET_VALIDATION_ERRORS,
})

export const setSearchLocations = locations => ({
  type: ActionTypes.SET_SEARCH_LOCATIONS,
  locations,
})

export const setSearchActivities = activities => ({
  type: ActionTypes.SET_SEARCH_ACTIVITIES,
  activities,
})

export const setSearchLocation = location => ({
  type: ActionTypes.SET_SEARCH_LOCATION,
  location,
})

export const setSearchSubLocation = subLocation => ({
  type: ActionTypes.SET_SEARCH_SUB_LOCATION,
  subLocation,
})

export const setSearchActivity = activity => ({
  type: ActionTypes.SET_SEARCH_ACTIVITY,
  activity,
})

export const setSearchDate = date => ({
  type: ActionTypes.SET_SEARCH_DATE,
  date,
})

export const setSearchPeriod = period => ({
  type: ActionTypes.SET_SEARCH_PERIOD,
  period,
})

export const setHouseblockData = data => ({
  type: ActionTypes.SET_HOUSEBLOCK_DATA,
  data,
})

export const setOrderField = orderField => ({
  type: ActionTypes.SET_ORDER_FIELD,
  orderField,
})

export const setSortOrder = sortOrder => ({
  type: ActionTypes.SET_ORDER,
  sortOrder,
})

export const setActivityData = data => ({
  type: ActionTypes.SET_ACTIVITY_DATA,
  data,
})

export const showPaymentReasonModal = data => ({
  type: ActionTypes.SET_SHOW_MODAL,
  payload: {
    identifier: 'payment-reason-modal',
    data,
  },
})

export const hideModal = () => ({
  type: ActionTypes.SET_SHOW_MODAL,
})

export const setMenuOpen = payload => ({
  type: ActionTypes.SET_MENU_OPEN,
  payload,
})

export const setEstablishmentRollData = data => ({
  type: ActionTypes.SET_ESTABLISHMENT_ROLL_DATA,
  data,
})

export const setGlobalSearchText = searchText => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_TEXT,
  searchText,
})

export const setGlobalSearchLocationFilter = locationFilter => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_LOCATION_FILTER,
  locationFilter,
})

export const setGlobalSearchGenderFilter = genderFilter => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_GENDER_FILTER,
  genderFilter,
})

export const setGlobalSearchDateOfBirthFilter = dateOfBirthFilter => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_DATE_OF_BIRTH_FILTER,
  dateOfBirthFilter,
})

export const setGlobalSearchResults = data => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_RESULTS_DATA,
  data,
})

export const setGlobalSearchPageNumber = pageNumber => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_PAGINATION_PAGE_NUMBER,
  pageNumber,
})

export const setGlobalSearchPageSize = pageSize => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_PAGINATION_PAGE_SIZE,
  pageSize,
})

export const setGlobalSearchTotalRecords = totalRecords => ({
  type: ActionTypes.SET_GLOBAL_SEARCH_PAGINATION_TOTAL_RECORDS,
  totalRecords,
})

export const setApplicationTitle = title => ({
  type: ActionTypes.SET_APPLICATION_TITLE,
  title,
})

export function fetchContentSuccess(content) {
  return { type: ActionTypes.SET_CONTENT_SUCCESS, payload: content }
}

export const fetchContent = path => dispatch => {
  dispatch(setLoaded(false))
  dispatch(resetError())
  return contentfulClient
    .getEntries({
      content_type: 'pages',
      'fields.path': path,
    })
    .then(response => {
      if (response.items.length === 0) dispatch(setError('There is no content for this path.'))
      else dispatch(fetchContentSuccess(response.items[0].fields))
      dispatch(setLoaded(true))
    })
    .catch(error => {
      dispatch(setError(error))
      dispatch(setLoaded(true))
    })
}
