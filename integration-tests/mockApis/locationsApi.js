const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/locations/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),

  stubGroups: (caseload, status = 200) => {
    const json = [
      {
        name: '1',
        key: '1',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '2',
        key: '2',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '3',
        key: '3',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
    ]

    return stubFor({
      request: {
        method: 'GET',
        url: `/locations-inside-prison/locations/prison/${caseload.id}/groups`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: json,
      },
    })
  },

  stubLocationGroups: (locationGroups) =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/locations-inside-prison/locations/prison/.+?/groups',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationGroups || [],
      },
    }),
}
