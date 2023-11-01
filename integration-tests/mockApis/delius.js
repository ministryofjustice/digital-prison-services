const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/delius/health',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),

  stubDocuments: (offenderNo, documents) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/delius/case/${offenderNo}/documents`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: documents || [],
      },
    }),

  stubDocument: (documentId, content) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/delius/document/${documentId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: content || [],
      },
    }),
}
