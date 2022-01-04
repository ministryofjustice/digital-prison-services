const { stubFor } = require('./wiremock')

const doStub = (context, data, status) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/sequation-virtual-campus2-api/${context}/.+?`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data,
    },
  })

module.exports = {
  stubLearnerProfiles: (learnerProfiles, status = 200) => doStub('learnerProfile', learnerProfiles || [], status),

  stubLatestLearnerAssessments: (learnerAssessments, status = 200) =>
    doStub('latestLearnerAssessments', learnerAssessments || [], status),

  stubLearnerEducation: (learnerHistory, status = 200) => doStub('learnerEducation', learnerHistory || {}, status),

  stubLearnerGoals: (learnerGoals, status = 200) => doStub('learnerGoals', learnerGoals || {}, status),

  stubLearnerEmployabilitySkills: (learnerEmployabilitySkills, status = 200) =>
    doStub('learnerEmployabilitySkills', learnerEmployabilitySkills, status),
}
