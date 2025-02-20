const { getFor, stubFor, getMatchingRequests } = require('./wiremock')

const caseNoteTypes = [
  {
    code: 'OBSERVE',
    description: 'Observations',
    source: 'OCNS',
    subCodes: [
      {
        code: 'test',
        description: 'Test',
        active: true,
      },
    ],
  },
  {
    code: 'OMIC',
    description: 'OMiC',
    source: 'OCNS',
    subCodes: [
      {
        code: 'OPEN_COMM',
        description: 'Open Case Note',
        active: true,
      },
      {
        code: 'COMM',
        description: 'OMiC Communication',
        active: true,
      },
    ],
  },
  {
    code: 'POS',
    description: 'Positive Behaviour',
    subCodes: [{ code: 'IEP_ENC', description: 'Incentive Encouragement', active: true }],
  },
  {
    code: 'NEG',
    description: 'Negative Behaviour',
    subCodes: [
      { code: 'BEHAVEWARN', description: 'Behaviour Warning', active: true },
      { code: 'IEP_WARN', description: 'Incentive Warning', active: true },
    ],
  },
]

module.exports = {
  stubHealth: (status = 200) =>
    getFor({
      request: {
        method: 'GET',
        urlPath: '/casenotes/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubCaseNotes: (body) =>
    getFor({
      urlPath: '/casenotes/case-notes/A12345',
      body,
    }),
  stubDeleteCaseNote: () =>
    stubFor({
      request: {
        method: 'DELETE',
        urlPattern: '/casenotes/case-notes/A12345/.+?',
      },
      response: {
        status: 200,
      },
    }),
  stubDeleteCaseNoteAmendment: () =>
    stubFor({
      request: {
        method: 'DELETE',
        urlPattern: '/casenotes/case-notes/amendment/A12345/.+?',
      },
      response: {
        status: 200,
      },
    }),
  stubCaseNoteTypes: (types) =>
    getFor({
      urlPattern: '/casenotes/case-notes/types.+?',
      body: types || caseNoteTypes,
    }),
  stubCaseNoteTypesForUser: (types) =>
    getFor({
      urlPattern: '/casenotes/case-notes/types.+?',
      body: types || caseNoteTypes,
    }),
  stubGetCaseNote: (response) =>
    getFor({
      urlPattern: '/casenotes/case-notes/A12345/1',
      body: response,
    }),
  stubGetOffenderCaseNote: (offenderId, caseNoteId, caseNoteResponse) =>
    getFor({
      urlPattern: `/casenotes/case-notes/${offenderId}/${caseNoteId}`,
      body: caseNoteResponse,
    }),
  stubSaveAmendment: () =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/casenotes/case-notes/A12345/1',
      },
      response: {
        status: 201,
      },
    }),
  verifySaveAmendment: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPathPattern: '/casenotes/case-notes/A12345/1',
    }).then((data) => data.body.requests),
}
