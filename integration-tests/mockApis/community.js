const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/community/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),

  stubConvictions: (offenderNo, convictions) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/community/api/offenders/nomsNumber/${offenderNo}/convictions`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: convictions || [],
      },
    }),

  stubOffenderDetails: (offenderNo, details) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/community/api/offenders/nomsNumber/${offenderNo}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || [],
      },
    }),

  stubDocument: (offenderNo, documentId, content) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/community/api/offenders/nomsNumber/${offenderNo}/documents/${documentId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: content || [],
      },
    }),

  stubDocuments: (offenderNo, documents) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/community/api/offenders/nomsNumber/${offenderNo}/documents/grouped`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: documents || [],
      },
    }),
}
