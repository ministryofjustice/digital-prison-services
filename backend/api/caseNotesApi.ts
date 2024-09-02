import moment from 'moment'
import qs from 'querystring'
import contextProperties from '../contextProperties'

export const processResponse = (context) => (response) => {
  if (!response.body.pageable) {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }
  const headers = {
    'total-records': (response.body.totalElements || 0).toString(),
    'page-offset': (response.body.pageable.offset || 0).toString(),
    'page-limit': (response.body.pageable.pageSize || 20).toString(),
  }
  contextProperties.setResponsePagination(context, headers)
  return response.body
}

export const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return {}
}
export const DATE_ONLY_FORMAT_SPEC = 'DD/MM/YYYY'
export const ISO_8601_DATE_FORMAT_START_OF_DAY = 'YYYY-MM-DDT00:00:00'
export const ISO_8601_DATE_FORMAT_END_OF_DAY = 'YYYY-MM-DDT23:59:59'
export const momentTo8601DateString = (m, f) => (m ? m.format(f) : '')
export const momentFromDateOnlyFormatString = (s) => (s ? moment(s, DATE_ONLY_FORMAT_SPEC) : null)
export const dateOnlyFormatTo8601 = (s, f) => momentTo8601DateString(momentFromDateOnlyFormatString(s), f)

export const toFormatStartOfDay = (date) =>
  date ? dateOnlyFormatTo8601(date, ISO_8601_DATE_FORMAT_START_OF_DAY) : null
export const toFormatEndOfDay = (date) => (date ? dateOnlyFormatTo8601(date, ISO_8601_DATE_FORMAT_END_OF_DAY) : null)

export const caseNotesApiFactory = (client) => {
  const get = (context, url) => client.get(context, url).then(processResponse(context)).catch(processError)

  const getCaseNotes = (context, offenderNo, data) => {
    const query = {
      size: data.perPage,
      page: data.pageNumber,
      type: data.type,
      subType: data.subType,
      startDate: toFormatStartOfDay(data.startDate),
      endDate: toFormatEndOfDay(data.endDate),
    }
    return client
      .get(context, `/case-notes/${offenderNo}?${qs.stringify(query)}`)
      .then(processResponse(context))
      .catch(processError)
  }

  const addCaseNote = (context, offenderNo, data?) =>
    client.post(context, `/case-notes/${offenderNo}`, data).then(processResponse(context))

  const amendCaseNote = (context, offenderNo, caseNoteId, data?) =>
    client.put(context, `/case-notes/${offenderNo}/${caseNoteId}`, data).then(processResponse(context))

  const getCaseNoteTypes = (context) =>
    get(context, '/case-notes/types?selectableBy=ALL&includeInactive=true&includeRestricted=true')

  const myCaseNoteTypes = (context) => {
    if (context?.userRoles?.find((role) => ['POM', 'ADD_SENSITIVE_CASE_NOTES'].includes(role.roleCode))) {
      return get(context, '/case-notes/types?selectableBy=DPS_USER&includeInactive=false&includeRestricted=true')
    }
    return get(context, '/case-notes/types?selectableBy=DPS_USER&includeInactive=false&includeRestricted=false')
  }

  const getCaseNote = (context, offenderNo, caseNoteId) => get(context, `/case-notes/${offenderNo}/${caseNoteId}`)

  const deleteCaseNote = (context, offenderNo, caseNoteId) =>
    client.sendDelete(context, `/case-notes/${offenderNo}/${caseNoteId}`).then(processResponse(context))

  const deleteCaseNoteAmendment = (context, offenderNo, caseNoteAmendmentId) =>
    client
      .sendDelete(context, `/case-notes/amendment/${offenderNo}/${caseNoteAmendmentId}`)
      .then(processResponse(context))

  return {
    getCaseNotes,
    getCaseNoteTypes,
    myCaseNoteTypes,
    addCaseNote,
    amendCaseNote,
    getCaseNote,
    deleteCaseNote,
    deleteCaseNoteAmendment,
  }
}

export default { caseNotesApiFactory }
