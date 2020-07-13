const moment = require('moment')
const qs = require('querystring')

const contextProperties = require('../contextProperties')

const processResponse = context => response => {
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

const processError = error => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return {}
}
const DATE_ONLY_FORMAT_SPEC = 'DD/MM/YYYY'
const ISO_8601_DATE_FORMAT_START_OF_DAY = 'YYYY-MM-DDT00:00:00'
const ISO_8601_DATE_FORMAT_END_OF_DAY = 'YYYY-MM-DDT23:59:59'
const momentTo8601DateString = (m, f) => (m ? m.format(f) : '')
const momentFromDateOnlyFormatString = s => (s ? moment(s, DATE_ONLY_FORMAT_SPEC) : null)
const dateOnlyFormatTo8601 = (s, f) => momentTo8601DateString(momentFromDateOnlyFormatString(s), f)

const toFormatStartOfDay = date => (date ? dateOnlyFormatTo8601(date, ISO_8601_DATE_FORMAT_START_OF_DAY) : null)
const toFormatEndOfDay = date => (date ? dateOnlyFormatTo8601(date, ISO_8601_DATE_FORMAT_END_OF_DAY) : null)

const caseNotesApiFactory = client => {
  const get = (context, url) =>
    client
      .get(context, url)
      .then(processResponse(context))
      .catch(processError)

  const getCaseNotes = (context, offenderNo, { perPage, pageNumber, type, subType, startDate, endDate }) => {
    const query = {
      size: perPage,
      page: pageNumber,
      type,
      subType,
      startDate: toFormatStartOfDay(startDate),
      endDate: toFormatEndOfDay(endDate),
    }
    return client
      .get(context, `/case-notes/${offenderNo}?${qs.stringify(query)}`)
      .then(processResponse(context))
      .catch(processError)
  }

  const addCaseNote = (context, offenderNo, data) =>
    client.post(context, `/case-notes/${offenderNo}`, data).then(processResponse(context))

  const amendCaseNote = (context, offenderNo, caseNoteId, data) =>
    client.put(context, `/case-notes/${offenderNo}/${caseNoteId}`, data).then(processResponse(context))

  const getCaseNoteTypes = context => get(context, '/case-notes/types')
  const myCaseNoteTypes = context => get(context, '/case-notes/types-for-user')

  const getCaseNote = (context, offenderNo, caseNoteId) => get(context, `/case-notes/${offenderNo}/${caseNoteId}`)

  return { getCaseNotes, getCaseNoteTypes, myCaseNoteTypes, addCaseNote, amendCaseNote, getCaseNote }
}

module.exports = { caseNotesApiFactory }
