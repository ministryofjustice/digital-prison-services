const auth = require('../mockApis/auth')
const prisonapi = require('../mockApis/prisonapi')
const dataComplianceApi = require('../mockApis/dataCompliance')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const keyworker = require('../mockApis/keyworker')
const caseNotes = require('../mockApis/caseNotes')
const activityResponse = require('../mockApis/responses/activityResponse')
const {
  courtEventsWithDifferentStatusResponse,
  externalTransfersResponse,
} = require('../mockApis/responses/houseBlockResponse')
const alertsResponse = require('../mockApis/responses/alertsResponse')
const allocationManager = require('../mockApis/allocationManager')
const community = require('../mockApis/community')
const pathfinder = require('../mockApis/pathfinder')
const socApi = require('../mockApis/soc')
const offenderSearch = require('../mockApis/offenderSearch')

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
    stubAuthHealth: status => Promise.all([auth.stubHealth(status)]),
    stubElite2Health: status => Promise.all([prisonapi.stubHealth(status)]),
    stubWhereaboutsHealth: status => Promise.all([whereabouts.stubHealth(status)]),
    stubAllocationManagerHealth: status => Promise.all([allocationManager.stubHealth(status)]),
    stubKeyworkerHealth: status => Promise.all([keyworker.stubHealth(status)]),
    stubCaseNotesHealth: status => Promise.all([caseNotes.stubHealth(status)]),
    stubCommunityHealth: status => Promise.all([community.stubHealth(status)]),
    stubTokenverificationHealth: status => Promise.all([tokenverification.stubHealth(status)]),
    stubOffenderSearchHealth: status => Promise.all([offenderSearch.stubHealth(status)]),

    stubHealthAllHealthy: () =>
      Promise.all([
        auth.stubHealth(),
        prisonapi.stubHealth(),
        whereabouts.stubHealth(),
        keyworker.stubHealth(),
        allocationManager.stubHealth(),
        caseNotes.stubHealth(),
        tokenverification.stubHealth(),
        community.stubHealth(),
        offenderSearch.stubHealth(),
      ]),
    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username = 'ITAG_USER', caseload = 'MDI', roles = [] }) =>
      Promise.all([
        auth.stubLogin(username, caseload, roles),
        prisonapi.stubUserMe(),
        prisonapi.stubUserCaseloads(),
        tokenverification.stubVerifyToken(true),
      ]),
    stubLoginCourt: () =>
      Promise.all([auth.stubLoginCourt(), prisonapi.stubUserCaseloads(), tokenverification.stubVerifyToken(true)]),

    stubUserEmail: username => Promise.all([auth.stubEmail(username)]),
    stubUser: (username, caseload) => Promise.all([auth.stubUser(username, caseload)]),
    stubStaff: ({ staffId, details }) => Promise.all([prisonapi.stubStaff(staffId, details)]),
    stubScheduledActivities: response => Promise.all([prisonapi.stubUserScheduledActivities(response)]),
    stubProgEventsAtLocation: ({ caseload, locationId, timeSlot, date, activities }) =>
      Promise.all([prisonapi.stubProgEventsAtLocation(caseload, locationId, timeSlot, date, activities)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
    stubCourts: courts => Promise.all([whereabouts.stubCourtLocations(courts)]),
    stubGroups: caseload => whereabouts.stubGroups(caseload),
    stubAddVideoLinkAppointment: appointment => Promise.all([whereabouts.stubAddVideoLinkAppointment(appointment)]),
    stubCaseNotes: response => caseNotes.stubCaseNotes(response),
    stubCaseNoteTypes: () => caseNotes.stubCaseNoteTypes(),

    stubForAttendance: ({ caseload, locationId, timeSlot, date, activities }) => {
      const offenderNumbers = extractOffenderNumbers(activities)
      return Promise.all([
        prisonapi.stubUserCaseloads(),
        prisonapi.stubProgEventsAtLocation(locationId, timeSlot, date, activities),
        prisonapi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        prisonapi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        prisonapi.stubVisits(activityResponse.visits),
        prisonapi.stubActivityLocations(),
        prisonapi.stubAppointments(),
        prisonapi.stubActivities(),
        prisonapi.stubCourtEvents(),
        prisonapi.stubExternalTransfers(),
        prisonapi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        prisonapi.stubAssessments(offenderNumbers),
        prisonapi.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubGetActivityList: ({ caseload, locationId, timeSlot, date, inThePast = false, activities }) => {
      let activity
      if (activities) {
        activity = activities
      } else {
        activity = inThePast ? activityResponse.pastActivities : activityResponse.activities
      }
      const offenderNumbers = extractOffenderNumbers(activity)
      return Promise.all([
        prisonapi.stubUserCaseloads(),
        prisonapi.stubProgEventsAtLocation(locationId, timeSlot, date, activity),
        prisonapi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        prisonapi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        prisonapi.stubVisits(activityResponse.visits),
        prisonapi.stubActivityLocations(),
        prisonapi.stubAppointments(activityResponse.appointments),
        prisonapi.stubActivities(activityResponse.activities),
        prisonapi.stubCourtEvents(courtEventsWithDifferentStatusResponse),
        prisonapi.stubExternalTransfers(externalTransfersResponse),
        prisonapi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        prisonapi.stubAssessments(offenderNumbers),
        prisonapi.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubPrisonerProfileHeaderData: ({
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary,
      caseNoteSummary,
      userRoles = [],
      retentionRecord,
      offenderNo,
    }) =>
      Promise.all([
        auth.stubUserMe(),
        auth.stubUserMeRoles([...userRoles, { roleCode: 'UPDATE_ALERT' }]),
        prisonapi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonapi.stubOffenderFullDetails(offenderFullDetails),
        prisonapi.stubIepSummaryForBookingIds(iepSummary),
        prisonapi.stubOffenderCaseNoteSummary(caseNoteSummary),
        prisonapi.stubUserCaseloads(),
        prisonapi.stubStaffRoles(),
        prisonapi.stubOffenderImage(),
        keyworker.stubKeyworkerByCaseloadAndOffenderNo(),
        dataComplianceApi.stubRetentionRecord(offenderNo, retentionRecord),
        allocationManager.stubGetPomForOffender({ primary_pom: { name: 'SMITH, JANE' } }),
      ]),

    stubAlertTypes: () => Promise.all([prisonapi.stubAlertTypes()]),
    stubAlertsForBooking: alerts => Promise.all([prisonapi.stubAlertsForBooking(alerts)]),
    stubAlerts: prisonapi.stubAlerts,

    stubInmates: prisonapi.stubInmates,
    stubUserLocations: prisonapi.stubUserLocations,

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
        prisonapi.stubMainOffence(offence),
        prisonapi.stubPrisonerDetails(prisonerDetails),
        prisonapi.stubPrisonerSentenceDetails(sentenceDetails),
        prisonapi.stubPrisonerBalances(balances),
        prisonapi.stubIepSummaryForBooking(iepSummary),
        prisonapi.stubPositiveCaseNotes(positiveCaseNotes),
        prisonapi.stubNegativeCaseNotes(negativeCaseNotes),
        prisonapi.stubAdjudicationsForBooking(adjudications),
        prisonapi.stubNextVisit(nextVisit),
        prisonapi.stubPrisonerVisitBalances(visitBalances),
        prisonapi.stubEventsForToday(todaysEvents),
        prisonapi.stubProfileInformation(profileInformation),
      ]),
    stubQuickLookApiErrors: () =>
      Promise.all([
        prisonapi.stubMainOffence(null, 500),
        prisonapi.stubPrisonerDetails([], 500),
        prisonapi.stubPrisonerSentenceDetails(null, 500),
        prisonapi.stubPrisonerBalances(null, 500),
        prisonapi.stubIepSummaryForBooking(null, 500),
        prisonapi.stubPositiveCaseNotes(null, 500),
        prisonapi.stubNegativeCaseNotes(null, 500),
        prisonapi.stubAdjudicationsForBooking(null, 500),
        prisonapi.stubNextVisit(null, 500),
        prisonapi.stubPrisonerVisitBalances(null, 500),
        prisonapi.stubEventsForToday([], 500),
        prisonapi.stubProfileInformation(null, 500),
      ]),
    stubPersonal: ({
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
      prisonOffenderManagers,
    }) =>
      Promise.all([
        prisonapi.stubIdentifiers(identifiers),
        prisonapi.stubOffenderAliases(aliases),
        prisonapi.stubPrisonerProperty(property),
        prisonapi.stubPrisonerContacts(contacts),
        prisonapi.stubPrisonerAddresses(addresses),
        prisonapi.stubSecondaryLanguages(secondaryLanguages),
        prisonapi.stubPersonAddresses(personAddresses),
        prisonapi.stubPersonEmails(personEmails),
        prisonapi.stubPersonPhones(personPhones),
        prisonapi.stubTreatmentTypes(treatmentTypes),
        prisonapi.stubHealthTypes(healthTypes),
        prisonapi.stubPersonalCareNeeds(careNeeds),
        prisonapi.stubReasonableAdjustments(reasonableAdjustments),
        prisonapi.stubAgencies(agencies),
        allocationManager.stubGetPomForOffender(prisonOffenderManagers),
      ]),
    stubReleaseDatesOffenderNo: releaseDates => Promise.all([prisonapi.stubPrisonerSentenceDetails(releaseDates)]),
    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubGetAbsenceReasons: response => Promise.all([whereabouts.stubGetAbsenceReasons()]),
    stubGetAttendance: ({ caseload, locationId, timeSlot, date, data }) =>
      Promise.all([whereabouts.stubGetAttendance(caseload, locationId, timeSlot, date, data)]),
    stubPostAttendance: response => whereabouts.stubPostAttendance(response),
    stubPutAttendance: response => whereabouts.stubPutAttendance(response),
    verifyPostAttendance: () => whereabouts.verifyPostAttendance(),
    stubSentenceAdjustments: response => prisonapi.stubGetSentenceAdjustments(response),
    stubMovementsBetween: prisonapi.stubMovementsBetween,
    stubOffenderBasicDetails: basicDetails => Promise.all([prisonapi.stubOffenderBasicDetails(basicDetails)]),
    stubOffenderFullDetails: fullDetails => Promise.all([prisonapi.stubOffenderFullDetails(fullDetails)]),
    stubAppointmentTypes: types => Promise.all([prisonapi.stubAppointmentTypes(types)]),
    stubAppointmentsAtAgency: (agency, locations) =>
      Promise.all([prisonapi.stubUsageAtAgency(agency, 'APP', locations)]),
    stubVisitsAtAgency: (agency, locations) => Promise.all([prisonapi.stubUsageAtAgency(agency, 'VISIT', locations)]),
    stubActivityLocations: status => prisonapi.stubActivityLocations(status),
    stubPostAppointments: () => Promise.all([prisonapi.stubPostAppointments()]),
    stubSchedules: ({ agency, location, date, appointments, visits, activities }) =>
      Promise.all([
        prisonapi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments),
        prisonapi.stubSchedulesAtLocation(location, 'APP', date, appointments),
        prisonapi.stubSchedulesAtAgency(agency, location, 'VISIT', date, visits),
        prisonapi.stubSchedulesAtLocation(location, 'VISIT', date, visits),
        prisonapi.stubCourtEvents(),
        prisonapi.stubActivitySchedules(location, date, activities),
        prisonapi.stubVisits(visits),
        prisonapi.stubExternalTransfers(),
        prisonapi.stubAppointments(appointments),
        prisonapi.stubActivities(activities),
      ]),
    stubSentenceData: details => prisonapi.stubSentenceData(details),
    stubLocation: ({ locationId, locationData }) => Promise.all([prisonapi.stubLocation(locationId, locationData)]),
    stubAgencyDetails: ({ agencyId, details }) => Promise.all([prisonapi.stubAgencyDetails(agencyId, details)]),
    stubAppointmentLocations: ({ agency, locations }) =>
      Promise.all([prisonapi.stubAppointmentLocations(agency, locations)]),
    stubBookingOffenders: offenders => Promise.all([prisonapi.stubBookingOffenders(offenders)]),
    stubAgencies: agencies => Promise.all([prisonapi.stubAgencies(agencies)]),
    stubAppointmentsAtAgencyLocation: ({ agency, location, date, appointments }) =>
      Promise.all([prisonapi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments)]),
    stubCourtCases: courtCases => prisonapi.stubCourtCases(courtCases),
    stubOffenceHistory: offenceHistory => prisonapi.stubOffenceHistory(offenceHistory),
    stubSentenceTerms: sentenceTerms => prisonapi.stubSentenceTerms(sentenceTerms),
    stubClientCredentialsRequest: () => auth.stubClientCredentialsRequest(),
    stubUserMeRoles: roles => auth.stubUserMeRoles(roles),
    stubUserMe: () => auth.stubUserMe(),
    stubPathFinderOffenderDetails: details => pathfinder.getOffenderDetails(details),
    stubSocOffenderDetails: details => socApi.stubGetOffenderDetails(details),
    stubVisitsWithVisitors: ({ visitsWithVisitors, offenderBasicDetails, visitTypes }) =>
      Promise.all([
        prisonapi.stubVisitsWithVisitors(visitsWithVisitors),
        prisonapi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonapi.stubVisitTypes(visitTypes),
      ]),
    stubSchedule: ({ offenderBasicDetails, thisWeeksSchedule, nextWeeksSchedule }) =>
      Promise.all([
        prisonapi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonapi.stubScheduledEventsForThisWeek(thisWeeksSchedule),
        prisonapi.stubScheduledEventsForNextWeek(nextWeeksSchedule),
      ]),
    stubAppointmentsGet: prisonapi.stubAppointmentsGet,
    stubVideoLinkAppointments: whereabouts.stubVideoLinkAppointments,
    stubCreateAlert: prisonapi.stubCreateAlert,
    stubCreateCaseNote: caseNotes.stubCreateCaseNote,
    stubCaseNoteTypesForUser: caseNotes.stubCaseNoteTypesForUser,
    stubGlobalSearch: offenderSearch.stubGlobalSearch,
    stubPrisonApiGlobalSearch: prisonapi.stubPrisonApiGlobalSearch,
    stubGlobalSearchMultiplePages: offenderSearch.stubGlobalSearchMultiplePages,
    stubOffenderImage: prisonapi.stubOffenderImage,
    verifyGlobalSearch: offenderSearch.verifyGlobalSearch,
    stubOffenderMovements: prisonapi.stubOffenderMovements,
    stubGetCaseNote: caseNote => caseNotes.stubGetCaseNote(caseNote),
    stubBookingDetails: details => prisonapi.stubBookingDetails(details),
    verifySaveAmendment: caseNotes.verifySaveAmendment,
    stubSaveAmendment: caseNotes.stubSaveAmendment,
    stubBookingNonAssociations: response => prisonapi.stubBookingNonAssociations(response),
    stubProfessionalContacts: ({
      offenderBasicDetails,
      contacts,
      personAddresses,
      personEmails,
      personPhones,
      prisonOffenderManagers,
    }) =>
      Promise.all([
        prisonapi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonapi.stubPrisonerContacts(contacts),
        prisonapi.stubPersonAddresses(personAddresses),
        prisonapi.stubPersonEmails(personEmails),
        prisonapi.stubPersonPhones(personPhones),
        allocationManager.stubGetPomForOffender(prisonOffenderManagers),
      ]),
    stubUserCaseLoads: caseloads => prisonapi.stubUserCaseloads(caseloads),
    stubUpdateCaseload: prisonapi.stubUpdateCaseload,
    stubCellAttributes: prisonapi.stubCellAttributes,
    stubMainOffence: offence => prisonapi.stubMainOffence(offence),
    stubCsraAssessments: ({ offenderNumbers, assessments }) =>
      prisonapi.stubCsraAssessments(offenderNumbers, assessments),
    stubNoExistingOffenderRecord: ({ offenderNo }) => dataComplianceApi.stubNoExistingOffenderRecord(offenderNo),
    stubRetentionRecord: ({ offenderNo, record }) => dataComplianceApi.stubRetentionRecord(offenderNo, record),
    stubGetOffenderRetentionReasons: dataComplianceApi.stubGetOffenderRetentionReasons,
    stubCreateRecord: ({ offenderNo }) => dataComplianceApi.stubCreateRecord(offenderNo),
    stubCellsWithCapacity: ({ cells }) => prisonapi.stubCellsWithCapacity(cells),
    stubCellsWithCapacityByGroupName: ({ agencyId, groupName, response }) =>
      whereabouts.stubCellsWithCapacityByGroupName({ agencyId, groupName, response }),
    stubInmatesAtLocation: ({ inmates }) => prisonapi.stubInmatesAtLocation(inmates),
    stubOffenderCellHistory: ({ history }) => prisonapi.stubOffenderCellHistory(history),
    stubGetAlerts: ({ agencyId, alerts }) => prisonapi.stubGetAlerts({ agencyId, alerts }),
    stubGetAlert: ({ bookingId, alertId, alert }) => prisonapi.stubGetAlert({ bookingId, alertId, alert }),
    stubPutAlert: ({ bookingId, alertId, alert }) => prisonapi.stubPutAlert({ bookingId, alertId, alert }),
    stubHistoryForLocation: locationHistory => prisonapi.stubHistoryForLocation(locationHistory),
    stubAttributesForLocation: locationAttributes => prisonapi.stubAttributesForLocation(locationAttributes),
    stubPrisonerDetail: ({ prisonerDetail, bookingId }) => prisonapi.stubPrisonerDetail(prisonerDetail, bookingId),
    stubPrisonerFullDetail: ({ prisonerDetail, offenderNo, fullInfo }) =>
      prisonapi.stubPrisonerFullDetail(prisonerDetail, offenderNo, fullInfo),
    stubMoveToCell: () => prisonapi.stubMoveToCell(),
    stubMoveToCellSwap: () => prisonapi.stubMoveToCellSwap(),
    verifyMoveToCell: ({ bookingId, locationPrefix }) => prisonapi.verifyMoveToCell({ bookingId, locationPrefix }),
    stubGetLocationPrefix: ({ agencyId, groupName, response }) =>
      whereabouts.stubGetLocationPrefix({ agencyId, groupName, response }),
    verifyMoveToCellSwap: ({ bookingId }) => prisonapi.verifyMoveToCellSwap({ bookingId }),
    stubAttendanceStats: ({ agencyId, fromDate, period, stats }) =>
      whereabouts.stubAttendanceStats(agencyId, fromDate, period, stats),
    stubEstablishmentRollCount: ({ agencyId, assignedMovements, unassignedMovements, movements, enroute }) =>
      Promise.all([
        prisonapi.stubAssignedMovements(agencyId, assignedMovements),
        prisonapi.stubUnassignedMovements(agencyId, unassignedMovements),
        prisonapi.stubRollcountByType(agencyId, 'movements', movements),
        prisonapi.stubRollcountByType(agencyId, 'enroute', enroute),
      ]),
    stubCourtEvents: courtEvents => prisonapi.stubCourtEvents(courtEvents),
    stubGetEventsByLocationIds: ({ agencyId, date, timeSlot, response }) =>
      prisonapi.stubGetEventsByLocationIds(agencyId, date, timeSlot, response),
    stubExternalTransfers: response => prisonapi.stubExternalTransfers(response),
    stubAssessments: offenderNumbers => prisonapi.stubAssessments(offenderNumbers),
    stubGetAgencyGroupLocations: ({ agencyId, groupName, response }) =>
      whereabouts.stubGetAgencyGroupLocations({ agencyId, groupName, response }),
    stubLocationGroups: locationGroups => whereabouts.stubLocationGroups(locationGroups),
    stubActivityLocationsByDateAndPeriod: ({ locations, date, period, withFault }) =>
      prisonapi.stubActivityLocationsByDateAndPeriod(locations, date, period, withFault),
    stubActivityLocationsConnectionResetFault: () => prisonapi.stubActivityLocationsConnectionResetFault(),
    stubGetAttendancesForBookings: ({ agencyId, timeSlot, date, data }) =>
      whereabouts.stubGetAttendancesForBookings(agencyId, timeSlot, date, data),
    stubGetAdjudicationDetails: adjudicationDetails => prisonapi.stubGetAdjudicationDetails(adjudicationDetails),
    stubAdjudicationFindingTypes: types => prisonapi.stubAdjudicationFindingTypes(types),
    stubAdjudications: ({ response, headers }) => prisonapi.stubAdjudications(response, headers),
    verifyAdjudicationsHistory: ({ offenderNo, agencyId, finding, fromDate, toDate }) =>
      prisonapi.verifyAdjudicationsHistory({ offenderNo, agencyId, finding, fromDate, toDate }),
    resetAdjudicationsStub: () => prisonapi.resetAdjudicationsStub(),
    stubConvictions: ({ offenderNo, convictions }) => community.stubConvictions(offenderNo, convictions),
    stubOffenderDetails: ({ offenderNo, details }) => community.stubOffenderDetails(offenderNo, details),
    stubDocuments: ({ offenderNo, documents }) => community.stubDocuments(offenderNo, documents),
    stubDocument: ({ offenderNo, documentId, content }) => community.stubDocument(offenderNo, documentId, content),
    stubIepSummaryForBooking: iepSummary => prisonapi.stubIepSummaryForBooking(iepSummary),
    stubMovementsIn: ({ agencyId, fromDate, movements }) =>
      prisonapi.stubMovementsIn({ agencyId, fromDate, movements }),
    stubMovementsOut: ({ agencyId, fromDate, movements }) =>
      prisonapi.stubMovementsOut({ agencyId, fromDate, movements }),
    stubIepSummaryForBookingIds: prisonapi.stubIepSummaryForBookingIds,
    stubSystemAlerts: prisonapi.stubSystemAlerts,
    stubInReception: ({ agencyId, results }) => prisonapi.stubRollcountByType(agencyId, 'in-reception', results),
    stubEnRoute: ({ agencyId, results }) => prisonapi.stubEnRoute(agencyId, results),
    stubCurrentlyOut: ({ livingUnitId, movements }) => prisonapi.stubCurrentlyOut(livingUnitId, movements),
    stubTotalCurrentlyOut: ({ agencyId, movements }) => prisonapi.stubTotalCurrentlyOut(agencyId, movements),
    stubGetAgencyIepLevels: response => prisonapi.stubGetAgencyIepLevels(response),
    stubChangeIepLevel: body => prisonapi.stubChangeIepLevel(body),
  })
}
