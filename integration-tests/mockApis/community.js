const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/community/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },

  stubConvictions: (offenderNo, convictions) => {
    return stubFor({
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
    })
  },

  stubOffenderDetails: (offenderNo, details) => {
    return stubFor({
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
    })
  },

  stubDocument: (offenderNo, documentId, content) => {
    return stubFor({
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
    })
  },

  stubDocuments: (offenderNo, documents) => {
    return stubFor({
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
    })
  },
}
