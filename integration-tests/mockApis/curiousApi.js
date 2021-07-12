const { stubFor } = require('./wiremock')

module.exports = {
  stubLatestLearnerAssessments: (learnerAssessments, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/latestLearnerAssessments/.+?\\`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerAssessments || {},
      },
    }),
}
