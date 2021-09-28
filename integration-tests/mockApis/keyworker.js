const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/keyworker/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubKeyworkerByCaseloadAndOffenderNo: (details) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/keyworker/key-worker/.+?/offender/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {
          firstName: 'John',
          lastName: 'Smith',
        },
      },
    }),
  stubKeyworkerMigrated: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/prison/.+?`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          migrated: false,
        },
      },
    }),
}
