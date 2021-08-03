const { stubFor } = require('./wiremock')

module.exports = {
  stubLatestLearnerAssessments: (learnerAssessments, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/sequation-virtual-campus2-api/latestLearnerAssessments/.+?`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerAssessments || [],
      },
    }),
  stubLearnerEducation: (learnerHistory, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/sequation-virtual-campus2-api/learnerEducation/.+?`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerHistory || [],
      },
    }),
}
