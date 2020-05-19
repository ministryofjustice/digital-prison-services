const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const keyworker = require('../mockApis/keyworker')
const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username, caseload }) =>
      Promise.all([auth.stubLogin(username, caseload), elite2api.stubUserMe(), elite2api.stubUserCaseloads()]),
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt({}), elite2api.stubUserCaseloads()]),

    stubScheduledActivities: response => Promise.all([elite2api.stubUserScheduledActivities(response)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),

    stubPrisonerProfileHeaderData: ({ offenderBasicDetails, offenderFullDetails, iepSummary, caseNoteSummary }) =>
      Promise.all([
        auth.stubUserMe(),
        auth.stubUserMeRoles(),
        elite2api.stubOffenderBasicDetails(offenderBasicDetails),
        elite2api.stubOffenderFullDetails(offenderFullDetails),
        elite2api.stubIepSummaryForBookingIds(iepSummary),
        elite2api.stubOffenderCaseNoteSummary(caseNoteSummary),
        elite2api.stubUserCaseloads(),
        elite2api.stubStaffRoles(),
        elite2api.stubOffenderImage(),
        keyworker.stubKeyworkerByCaseloadAndOffenderNo(),
      ]),

    stubAlertTypes: () => Promise.all([elite2api.stubAlertTypes()]),
    stubAlertsForBooking: alerts => Promise.all([elite2api.stubAlertsForBooking(alerts)]),
  })
}
