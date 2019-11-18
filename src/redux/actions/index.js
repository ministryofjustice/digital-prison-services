import axios from 'axios'
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

export const setSearchWingStatus = wingStatus => ({
  type: ActionTypes.SET_SEARCH_WING_STATUS,
  wingStatus,
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

export const setActivityOffenderAttendance = (offenderIndex, attendanceInfo) => ({
  type: ActionTypes.SET_ACTIVITY_OFFENDER_ATTENDANCE,
  offenderIndex: parseInt(offenderIndex, 0),
  attendanceInfo,
})

export const setHouseblockOffenderAttendance = (offenderIndex, attendanceInfo) => ({
  type: ActionTypes.SET_HOUSEBLOCK_OFFENDER_ATTENDANCE,
  offenderIndex: parseInt(offenderIndex, 0),
  attendanceInfo,
})

export const setMenuOpen = payload => ({
  type: ActionTypes.SET_MENU_OPEN,
  payload,
})

export const setEstablishmentRollData = data => ({
  type: ActionTypes.SET_ESTABLISHMENT_ROLL_DATA,
  data,
})

export const setAdjudicationDetail = detail => ({
  type: ActionTypes.SET_ADJUDICATION_DETAIL,
  detail,
})

export const setAdjudicationHistoryResults = results => ({
  type: ActionTypes.SET_ADJUDICATION_HISTORY_RESULTS,
  results,
})

export const setAdjudicationHistoryFilter = fields => ({
  type: ActionTypes.SET_ADJUDICATION_HISTORY_FILTER,
  fields,
})

export const setAdjudicationHistoryPageNumber = number => ({
  type: ActionTypes.SET_ADJUDICATION_HISTORY_PAGE_NUMBER,
  number,
})

export const setAdjudicationHistoryPageSize = size => ({
  type: ActionTypes.SET_ADJUDICATION_HISTORY_PAGE_SIZE,
  size,
})

export const setIepHistoryResults = results => ({
  type: ActionTypes.SET_IEP_HISTORY_RESULTS,
  results,
})

export const setPossibleIepLevels = levels => ({
  type: ActionTypes.SET_POSSIBLE_IEP_LEVELS,
  levels,
})

export const setIepHistoryFilter = fields => ({
  type: ActionTypes.SET_IEP_HISTORY_FILTER,
  fields,
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

export function setAbsentReasons(reasons) {
  return { type: ActionTypes.SET_ABSENT_REASONS, payload: reasons }
}

export const getAbsentReasons = () => dispatch =>
  axios
    .get('/api/attendance/absence-reasons')
    .then(response => {
      if (response.error) throw response.error
      dispatch(setAbsentReasons(response.data))
      return response.data
    })
    .catch(error => {
      dispatch(setError(error))
    })

export const setAppointmentDetails = appointmentDetails => ({
  type: ActionTypes.SET_BULK_APPOINTMENT_DETAILS,
  appointmentDetails,
})

export const setAppointmentPrisoners = prisoners => ({
  type: ActionTypes.SET_BULK_APPOINTMENT_PRISONERS,
  prisoners,
})

export const setBulkAppointmentsComplete = () => ({
  type: ActionTypes.SET_BULK_APPOINTMENTS_COMPLETE,
})

export const setOffender = offender => ({ type: ActionTypes.SET_OFFENDER, offender })

export const setShowModal = (modalActive, modalContent) => ({
  type: ActionTypes.SET_SHOW_MODAL,
  modalActive,
  modalContent,
})
