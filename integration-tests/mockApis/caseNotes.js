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
  {
    code: 'OMIC',
    description: 'OMiC',
    activeFlag: 'Y',
    source: 'OCNS',
    subCodes: [
      {
        code: 'OPEN_COMM',
        description: 'Open Case Note',
        activeFlag: 'Y',
      },
      {
        code: 'COMM',
        description: 'OMiC Communication',
        activeFlag: 'Y',
      },
    ],
  },
  {
    code: 'POS',
    description: 'Positive Behaviour',
    activeFlag: 'Y',
    subCodes: [{ code: 'IEP_ENC', description: 'Incentive Encouragement', activeFlag: 'Y' }],
  },
  {
    code: 'NEG',
    description: 'Negative Behaviour',
    activeFlag: 'Y',
    subCodes: [
      { code: 'BEHAVEWARN', description: 'Behaviour Warning', activeFlag: 'Y' },
      { code: 'IEP_WARN', description: 'Incentive Warning', activeFlag: 'Y' },
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
  stubCreateCaseNote: (body) =>
    stubFor({
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
  verifySaveCaseNote: () =>
    getMatchingRequests({
      method: 'POST',
      urlPattern: '/casenotes/case-notes/.+?',
    }).then((data) => data.body.requests),
}
