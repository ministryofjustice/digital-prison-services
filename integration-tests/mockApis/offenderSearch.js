const { stubFor, postFor, getMatchingRequests } = require('./wiremock')
const globalSearchResponse = require('./responses/globalSearchResponse.json')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/offenderSearch/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubGlobalSearch: () =>
    postFor({
      urlPattern: '/offenderSearch/global-search\\?size=20',
      body: {
        totalElements: 2,
        pageable: { pageSize: 20, offset: 0 },
        content: [
          {
            prisonerNumber: 'A1234AC',
            firstName: 'FRED',
            lastName: 'QUIMBY',
            prisonName: 'Leeds HMP',
            dateOfBirth: '1977-10-15',
            prisonId: 'LEI',
            locationDescription: 'Leeds HMP',
            status: 'ACTIVE',
            bookingId: 1,
          },
          {
            prisonerNumber: 'A1234AA',
            firstName: 'ARTHUR',
            lastName: 'QUIMBY',
            prisonName: 'Moorland HMP',
            dateOfBirth: '1976-09-15',
            prisonId: 'MDI',
            locationDescription: 'Moorland HMP',
            status: 'INACTIVE',
            bookingId: 2,
          },
        ],
      },
    }),
  stubPrisonerSearch: () =>
    postFor({
      urlPattern: '/offenderSearch/prisoner-search/prisoner-numbers',
      body: {
        totalElements: 2,
        pageable: { pageSize: 20, offset: 0 },
        content: [
          {
            prisonerNumber: 'A1234AC',
            indeterminiteSentence: false,
          },
          {
            prisonerNumber: 'A1234AA',
            indeterminiteSentence: false,
          },
        ],
      },
    }),
  verifyGlobalSearch: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/offenderSearch/global-search',
    }).then((data) => data.body.requests),

  stubGlobalSearchMultiplePages: () => {
    const resultsPerPage = 20
    const firstPage = globalSearchResponse.slice(0, resultsPerPage)
    const nextPage = globalSearchResponse.slice(resultsPerPage)
    return Promise.all([
      postFor({
        urlPattern: `/offenderSearch/global-search\\?size=${resultsPerPage}`,
        body: {
          totalElements: globalSearchResponse.length,
          pageable: { pageSize: resultsPerPage, offset: 0 },
          content: firstPage,
        },
      }),
      postFor({
        urlPattern: `/offenderSearch/global-search\\?page=1&size=${resultsPerPage}`,
        body: {
          totalElements: globalSearchResponse.length,
          pageable: { pageSize: resultsPerPage, offset: resultsPerPage },
          content: nextPage,
        },
      }),
    ])
  },
  stubPrisonerSearchDetails: (response) =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/offenderSearch/prisoner-search/prisoner-numbers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubInmates: ({ locationId, params, count, data = [] }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/offenderSearch/prison/${locationId}/prisoners`,
        queryParameters: params,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { content: data, totalElements: count, pageable: { pageSize: 50, offset: 0 } },
      },
    }),
  stubPrisonerDetails: (response) =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/offenderSearch/prisoner-search/prisoner-numbers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
}
