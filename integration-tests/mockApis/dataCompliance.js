const { stubFor } = require('./wiremock')

module.exports = {
  stubGetOffenderRetentionReasons: () => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/datacompliance/retention/offenders/retention-reasons',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ETag: '0',
        },
        jsonBody: [
          {
            reasonCode: 'HIGH_PROFILE',
            displayName: 'High Profile Offenders',
            allowReasonDetails: false,
            displayOrder: 0,
          },
          {
            reasonCode: 'OTHER',
            displayName: 'Other',
            allowReasonDetails: true,
            displayOrder: 1,
          },
        ],
      },
    })
  },

  stubNoExistingOffenderRecord: offenderNo => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/datacompliance/retention/offenders/${offenderNo}`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    })
  },

  stubRetentionRecord: (offenderNo, retentionRecord, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/datacompliance/retention/offenders/${offenderNo}`,
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

  stubCreateRecord: offenderNo => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/datacompliance/retention/offenders/${offenderNo}`,
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ETag: '0',
        },
        jsonBody: {},
      },
    })
  },
}
