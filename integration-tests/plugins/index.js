const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username, caseload }) =>
      Promise.all([auth.stubLogin(username, caseload), elite2api.stubUserMe(), elite2api.stubUserCaseloads()]),
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt({}), elite2api.stubUser(), elite2api.stubUserCaseloads()]),

    stubScheduledActivities: response => Promise.all([elite2api.stubUserScheduledActivities(response)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
  })
}
