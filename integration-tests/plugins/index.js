const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const keyworker = require('../mockApis/keyworker')
const caseNotes = require('../mockApis/caseNotes')

const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: resetStubs,
    resetAndStubTokenVerification: async () => {
      await resetStubs()
      return tokenverification.stubVerifyToken(true)
    },
    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username = 'ITAG_USER', caseload = 'MDI' }) =>
      Promise.all([
        auth.stubLogin(username, caseload),
        elite2api.stubUserMe(),
        elite2api.stubUserCaseloads(),
        tokenverification.stubVerifyToken(true),
      ]),
    stubLoginCourt: () =>
      Promise.all([auth.stubLoginCourt({}), elite2api.stubUserCaseloads(), tokenverification.stubVerifyToken(true)]),

    stubScheduledActivities: response => Promise.all([elite2api.stubUserScheduledActivities(response)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
    stubCaseNotes: response => caseNotes.stubCaseNotes(response),
    stubCaseNoteTypes: () => caseNotes.stubCaseNoteTypes(),

    stubPrisonerProfileHeaderData: ({ offenderBasicDetails, offenderFullDetails, iepSummary, caseNoteSummary }) =>
      Promise.all([
        auth.stubUserMe(),
        auth.stubUserMeRoles([{ roleCode: 'UPDATE_ALERT' }]),
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
    stubAlerts: elite2api.stubAlerts,

    stubInmates: elite2api.stubInmates,

    stubQuickLook: ({
      offence,
      prisonerDetails,
      sentenceDetails,
      balances,
      iepSummary,
      positiveCaseNotes,
      negativeCaseNotes,
      adjudications,
      nextVisit,
      visitBalances,
      todaysEvents,
      profileInformation,
    }) =>
      Promise.all([
        elite2api.stubMainOffence(offence),
        elite2api.stubPrisonerDetails(prisonerDetails),
        elite2api.stubPrisonerSentenceDetails(sentenceDetails),
        elite2api.stubPrisonerBalances(balances),
        elite2api.stubIepSummaryForBooking(iepSummary),
        elite2api.stubPositiveCaseNotes(positiveCaseNotes),
        elite2api.stubNegativeCaseNotes(negativeCaseNotes),
        elite2api.stubAdjudicationsForBooking(adjudications),
        elite2api.stubNextVisit(nextVisit),
        elite2api.stubPrisonerVisitBalances(visitBalances),
        elite2api.stubEventsForToday(todaysEvents),
        elite2api.stubProfileInformation(profileInformation),
      ]),
    stubQuickLookApiErrors: () =>
      Promise.all([
        elite2api.stubMainOffence(null, 500),
        elite2api.stubPrisonerDetails([], 500),
        elite2api.stubPrisonerSentenceDetails(null, 500),
        elite2api.stubPrisonerBalances(null, 500),
        elite2api.stubIepSummaryForBooking(null, 500),
        elite2api.stubPositiveCaseNotes(null, 500),
        elite2api.stubNegativeCaseNotes(null, 500),
        elite2api.stubAdjudicationsForBooking(null, 500),
        elite2api.stubNextVisit(null, 500),
        elite2api.stubPrisonerVisitBalances(null, 500),
        elite2api.stubEventsForToday([], 500),
        elite2api.stubProfileInformation(null, 500),
      ]),
    stubPersonal: ({
      prisonerDetail,
      identifiers,
      aliases,
      property,
      contacts,
      addresses,
      secondaryLanguages,
      personAddresses,
      personEmails,
      personPhones,
      treatmentTypes,
      healthTypes,
      careNeeds,
      reasonableAdjustments,
      agencies,
    }) =>
      Promise.all([
        elite2api.stubPrisonerDetail(prisonerDetail),
        elite2api.stubIdentifiers(identifiers),
        elite2api.stubOffenderAliases(aliases),
        elite2api.stubPrisonerProperty(property),
        elite2api.stubPrisonerContacts(contacts),
        elite2api.stubPrisonerAddresses(addresses),
        elite2api.stubSecondaryLanguages(secondaryLanguages),
        elite2api.stubPersonAddresses(personAddresses),
        elite2api.stubPersonEmails(personEmails),
        elite2api.stubPersonPhones(personPhones),
        elite2api.stubTreatmentTypes(treatmentTypes),
        elite2api.stubHealthTypes(healthTypes),
        elite2api.stubPersonalCareNeeds(careNeeds),
        elite2api.stubReasonableAdjustments(reasonableAdjustments),
        elite2api.stubAgencies(agencies),
      ]),
    stubReleaseDatesOffenderNo: releaseDates => Promise.all([elite2api.stubPrisonerSentenceDetails(releaseDates)]),
    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
  })
}
