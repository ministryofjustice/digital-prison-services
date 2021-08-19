const { stubFor } = require('./wiremock')

module.exports = {
  stubLearnerProfiles: (learnerProfiles, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/sequation-virtual-campus2-api/learnerProfile/.+?`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerProfiles || [],
      },
    }),
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
  stubLearnerGoals: (learnerGoals, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/sequation-virtual-campus2-api/learnerGoals/.+?`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerGoals || {},
      },
    }),
}
