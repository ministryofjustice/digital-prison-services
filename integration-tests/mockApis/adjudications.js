const {stubFor, resetStub, verifyGet} = require("./wiremock");
module.exports = {
    verifyAdjudicationsHistory: ({ offenderNo, agencyId, finding, fromDate, toDate }) =>
        verifyGet(
            `/adjudications/adjudications/${offenderNo}/adjudications?agencyId=${agencyId}&finding=${finding}&fromDate=${fromDate}&toDate=${toDate}`
        ),
    stubAdjudications: (response, headers = {}) =>
        stubFor({
            request: {
                method: 'GET',
                urlPathPattern: '/adjudications/adjudications/A12345/adjudications',
            },
            response: {
                status: 200,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                jsonBody: response,
            },
        }),
    resetAdjudicationsStub: () => resetStub({ requestUrl: '/adjudications/adjudications/A12345/adjudications', method: 'GET' }),
    stubGetAdjudicationDetails: (adjudicationDetails) =>
        stubFor({
            request: {
                method: 'GET',
                urlPathPattern: `/adjudications/adjudications/.+?/charge/[0-9]+?`,
            },
            response: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                jsonBody: adjudicationDetails || {},
            },
        }),
    stubAdjudicationsForBooking: (adjudications, status = 200) =>
        stubFor({
            request: {
                method: 'GET',
                urlPattern: '/adjudications/by-booking-id/[0-9]+?',
            },
            response: {
                status,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                jsonBody: adjudications || {},
            },
        }),
}
