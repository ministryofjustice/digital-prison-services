const { stubFor } = require('./wiremock')

module.exports = {
  stubRetentionRecord: (retentionRecord, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/datacompliance/retention/offenders/.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ETag: '0',
        },
        jsonBody: retentionRecord || {},
      },
    })
  },
}
