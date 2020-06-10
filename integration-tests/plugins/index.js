const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const keyworker = require('../mockApis/keyworker')
const caseNotes = require('../mockApis/caseNotes')
const { pastActivities, activities, visits, appointments } = require('../mockApis/responses/activityResponse')
const { courtEventsWithDifferentStatusResponse } = require('../mockApis/responses/houseBlockResponse')

const { resetStubs } = require('../mockApis/wiremock')

const extractOffenderNumbers = activityList => {
  const result = Object.keys(activityList).reduce((r, k) => {
    return r.concat(activityList[k])
  }, [])
  return [...new Set(result.map(item => item.offenderNo))]
}

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

    stubOffenderBasicDetails: response => Promise.all([elite2api.stubOffenderBasicDetails(response)]),

    stubGetActivityList: ({ caseload, locationId, timeSlot, date, inThePast = false }) => {
      const activityResponse = inThePast ? pastActivities : activities
      const offenderNumbers = extractOffenderNumbers(activityResponse)

      return Promise.all([
        elite2api.stubProgEventsAtLocation(locationId, timeSlot, date, activityResponse),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        elite2api.stubVisits(caseload, timeSlot, date, offenderNumbers, visits),
        elite2api.stubAppointments(caseload, timeSlot, date, offenderNumbers, appointments),
        elite2api.stubActivities(caseload, timeSlot, date, offenderNumbers, activities),
        elite2api.stubCourtEvents(caseload, offenderNumbers, date, courtEventsWithDifferentStatusResponse),
        elite2api.stubExternalTransfers(caseload, offenderNumbers, date),
        elite2api.stubAlerts(offenderNumbers),
        elite2api.stubAssessments(offenderNumbers),
      ])
    },
    stubActivityLocations: () => Promise.all([elite2api.stubActivityLocations()]),

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
    stubGetAbsenceReasons: response => Promise.all([whereabouts.stubGetAbsenceReasons()]),
    stubGetAttendance: (caseload, locationId, timeSlot, date) =>
      Promise.all([whereabouts.stubGetAttendance(caseload, locationId, timeSlot, date)]),
  })
}
