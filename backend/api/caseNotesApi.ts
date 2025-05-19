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

export const caseNotesApiFactory = (client) => {
  const get = (context, url) => client.get(context, url).then(processResponse(context)).catch(processError)

  const amendCaseNote = (context, offenderNo, caseNoteId, data?) =>
    client.put(context, `/case-notes/${offenderNo}/${caseNoteId}`, data).then(processResponse(context))

  const deleteCaseNote = (context, offenderNo, caseNoteId) =>
    client.sendDelete(context, `/case-notes/${offenderNo}/${caseNoteId}`).then(processResponse(context))

  const deleteCaseNoteAmendment = (context, offenderNo, caseNoteAmendmentId) =>
    client
      .sendDelete(context, `/case-notes/amendment/${offenderNo}/${caseNoteAmendmentId}`)
      .then(processResponse(context))

  const getCaseNote = (context, offenderNo, caseNoteId) => get(context, `/case-notes/${offenderNo}/${caseNoteId}`)

  return {
    getCaseNote,
    amendCaseNote,
    deleteCaseNote,
    deleteCaseNoteAmendment,
  }
}

export default { caseNotesApiFactory }
