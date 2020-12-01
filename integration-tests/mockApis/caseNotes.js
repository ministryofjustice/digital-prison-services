const { getFor, stubFor, getMatchingRequests } = require('./wiremock')

const caseNoteTypes = [
  {
    code: 'OBSERVE',
    description: 'Observations',
    activeFlag: 'Y',
    source: 'OCNS',
    subCodes: [
      {
        code: 'test',
        description: 'Test',
        activeFlag: 'Y',
      },
    ],
  },
]

module.exports = {
  stubHealth: (status = 200) => {
    return getFor({
      request: {
        method: 'GET',
        url: '/casenotes/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },
  stubCaseNotes: body => {
    return getFor({
      urlPath: '/casenotes/case-notes/A12345',
      body,
    })
  },
  stubCreateCaseNote: body => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/casenotes/case-notes/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    })
  },
  stubCaseNoteTypes: types => {
    return getFor({
      urlPattern: '/casenotes/case-notes/types',
      body: types || caseNoteTypes,
    })
  },
  stubCaseNoteTypesForUser: () => {
    return getFor({
      urlPattern: '/casenotes/case-notes/types-for-user',
      body: caseNoteTypes,
    })
  },
  stubGetCaseNote: response => {
    return getFor({
      urlPattern: '/casenotes/case-notes/A12345/1',
      body: response,
    })
  },
  stubGetOffenderCaseNote: (offenderId, caseNoteId, caseNoteResponse) => {
    return getFor({
      urlPattern: `/casenotes/case-notes/${offenderId}/${caseNoteId}`,
      body: caseNoteResponse,
    })
  },
  stubSaveAmendment: () => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/casenotes/case-notes/A12345/1',
      },
      response: {
        status: 201,
      },
    })
  },
  verifySaveAmendment: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPathPattern: '/casenotes/case-notes/A12345/1',
    }).then(data => data.body.requests),
}
