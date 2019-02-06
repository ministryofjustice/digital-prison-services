import * as contentful from 'contentful'
import * as ActionTypes from './actionTypes'

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

const client = contentful.createClient({
  space: 'edstadadqo4d',
  accessToken: 'abdc8ae3aa1f2c4101dc91c44d49314b979c2116e40ae8ec0ba36d24f103a01d',
})

// Fetch Footer pages.  TODO: pass in param to set meta or footer
// https://www.contentful.com/blog/2018/01/23/how-to-write-reusable-sane-api-based-components/
// https://www.cuga-moylan.com/blog/searching-entries-by-linked-content-types-in-contentful/
export const fetchContent = () => dispatch =>
  client
    .getEntries({
      content_type: 'pages',
      'fields.category.sys.contentType.sys.id': 'categories',
      'fields.category.fields.title': 'Footer',
    })
    .then(response => console.log(response) || dispatch({ type: ActionTypes.FETCH_CONTENT, payload: response.items }))
