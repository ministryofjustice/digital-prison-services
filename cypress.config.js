/* eslint-disable import/no-extraneous-dependencies */

const { defineConfig } = require('cypress')

const auth = require('./integration-tests/mockApis/auth')
const prisonApi = require('./integration-tests/mockApis/prisonApi')
const incentivesApi = require('./integration-tests/mockApis/incentivesApi')
const dataComplianceApi = require('./integration-tests/mockApis/dataCompliance')
const whereabouts = require('./integration-tests/mockApis/whereabouts')
const tokenverification = require('./integration-tests/mockApis/tokenverification')
const keyworker = require('./integration-tests/mockApis/keyworker')
const caseNotes = require('./integration-tests/mockApis/caseNotes')
const activityResponse = require('./integration-tests/mockApis/responses/activityResponse')
const {
  courtEventsWithDifferentStatusResponse,
  externalTransfersResponse,
} = require('./integration-tests/mockApis/responses/houseBlockResponse')
const alertsResponse = require('./integration-tests/mockApis/responses/alertsResponse.json')
const allocationManager = require('./integration-tests/mockApis/allocationManager')
const community = require('./integration-tests/mockApis/community')
const pathfinder = require('./integration-tests/mockApis/pathfinder')
const socApi = require('./integration-tests/mockApis/soc')
const restrictedPatientApi = require('./integration-tests/mockApis/restrictedPatient')
const offenderSearch = require('./integration-tests/mockApis/offenderSearch')
const complexity = require('./integration-tests/mockApis/complexity')
const curiousApi = require('./integration-tests/mockApis/curiousApi')

const { stubScenario, resetStubs } = require('./integration-tests/mockApis/wiremock')

const extractOffenderNumbers = (activityList) => {
  const result = Object.keys(activityList).reduce((r, k) => r.concat(activityList[k]), [])
  return [...new Set(result.map((item) => item.offenderNo))]
}

module.exports = defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration-tests/fixtures',
  screenshotsFolder: 'integration-tests/screenshots',
  videosFolder: 'integration-tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 200000,
  pageLoadTimeout: 200000,
  viewportWidth: 1024,
  viewportHeight: 768,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        ...prisonApi,
        stubScenario,
        reset: resetStubs,
        resetAndStubTokenVerification: async () => {
          await resetStubs()
          return tokenverification.stubVerifyToken(true)
        },
        stubAuthHealth: (status) => auth.stubHealth(status),
        stubPrisonApiHealth: (status) => prisonApi.stubHealth(status),
        stubWhereaboutsHealth: (status) => whereabouts.stubHealth(status),
        stubAllocationManagerHealth: (status) => allocationManager.stubHealth(status),
        stubKeyworkerHealth: (status) => keyworker.stubHealth(status),
        stubCaseNotesHealth: (status) => caseNotes.stubHealth(status),
        stubCommunityHealth: (status) => community.stubHealth(status),
        stubTokenverificationHealth: (status) => tokenverification.stubHealth(status),
        stubOffenderSearchHealth: (status) => offenderSearch.stubHealth(status),
        stubHealthAllHealthy: () =>
          Promise.all([
            auth.stubHealth(),
            prisonApi.stubHealth(),
            whereabouts.stubHealth(),
            keyworker.stubHealth(),
            allocationManager.stubHealth(),
            caseNotes.stubHealth(),
            tokenverification.stubHealth(),
            community.stubHealth(),
            offenderSearch.stubHealth(),
            complexity.stubHealth(),
          ]),
        getSignInUrl: auth.getSignInUrl,
        stubSignIn: ({ username = 'ITAG_USER', caseload = 'MDI', roles = [], caseloads }) =>
          Promise.all([
            auth.stubSignIn(username, caseload, roles),
            auth.stubUserMe(username, 12345, 'James Stuart', caseload),
            prisonApi.stubUserCaseloads(caseloads),
            tokenverification.stubVerifyToken(true),
            keyworker.stubKeyworkerMigrated(),
          ]),
        stubSignInCourt: () =>
          Promise.all([auth.stubSignInCourt(), prisonApi.stubUserCaseloads(), tokenverification.stubVerifyToken(true)]),
        stubUserEmail: (username) => Promise.all([auth.stubEmail(username)]),
        stubUser: (username, caseload) => Promise.all([auth.stubUser(username, caseload)]),
        stubStaff: ({ staffId, details }) => Promise.all([prisonApi.stubStaff(staffId, details)]),
        stubScheduledActivities: (response) => Promise.all([prisonApi.stubUserScheduledActivities(response)]),
        stubProgEventsAtLocation: ({ caseload, locationId, timeSlot, date, activities }) =>
          Promise.all([prisonApi.stubProgEventsAtLocation(caseload, locationId, timeSlot, date, activities)]),

        stubAttendanceChanges: (response) => Promise.all([whereabouts.stubAttendanceChanges(response)]),
        stubCourts: whereabouts.stubCourtLocations,
        stubGroups: (caseload) => whereabouts.stubGroups(caseload),
        stubAddVideoLinkBooking: () => whereabouts.stubAddVideoLinkBooking(),
        getBookingRequest: () => whereabouts.getBookingRequest(),
        stubCaseNotes: caseNotes.stubCaseNotes,
        stubCaseNoteTypes: caseNotes.stubCaseNoteTypes,

        stubForAttendance: ({ caseload, locationId, timeSlot, date, activities }) => {
          const offenderNumbers = extractOffenderNumbers(activities)
          return Promise.all([
            prisonApi.stubUserCaseloads(),
            prisonApi.stubProgEventsAtLocation(locationId, timeSlot, date, activities),
            prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
            prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
            prisonApi.stubVisits(activityResponse.visits),
            prisonApi.stubActivityLocations(),
            prisonApi.stubAppointments(),
            prisonApi.stubActivities(),
            prisonApi.stubCourtEvents(),
            prisonApi.stubExternalTransfers(),
            prisonApi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
            prisonApi.stubAssessments(offenderNumbers),
            prisonApi.stubOffenderSentences(offenderNumbers, date),
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
            prisonApi.stubUserCaseloads(),
            prisonApi.stubProgEventsAtLocation(locationId, timeSlot, date, activity),
            prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
            prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
            prisonApi.stubVisits(activityResponse.visits),
            prisonApi.stubActivityLocations(),
            prisonApi.stubAppointments(activityResponse.appointments),
            prisonApi.stubActivities(activityResponse.activities),
            prisonApi.stubCourtEvents(courtEventsWithDifferentStatusResponse),
            prisonApi.stubExternalTransfers(externalTransfersResponse),
            prisonApi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
            prisonApi.stubAssessments(offenderNumbers),
            prisonApi.stubOffenderSentences(offenderNumbers, date),
          ])
        },

        stubPrisonerProfileHeaderData: ({
          offenderBasicDetails,
          offenderFullDetails,
          iepSummary,
          caseNoteSummary,
          retentionRecord,
          offenderNo,
          keyworkerDetails,
          complexOffenders = [],
          offenderSearchDetails = [{ restrictedPatient: false, indeterminateSentence: false }],
          caseloads = null,
        }) =>
          Promise.all([
            prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
            prisonApi.stubOffenderFullDetails(offenderFullDetails),
            incentivesApi.stubGetIepSummaryForBookingIds(iepSummary),
            prisonApi.stubOffenderCaseNoteSummary(caseNoteSummary),
            prisonApi.stubUserCaseloads(caseloads),
            prisonApi.stubStaffRoles(),
            prisonApi.stubOffenderImage(),
            keyworker.stubKeyworkerByCaseloadAndOffenderNo(keyworkerDetails),
            dataComplianceApi.stubRetentionRecord(offenderNo, retentionRecord),
            allocationManager.stubGetPomForOffender({ primary_pom: { name: 'SMITH, JANE' } }),
            complexity.stubGetComplexOffenders(complexOffenders),
            offenderSearch.stubPrisonerDetails(offenderSearchDetails),
          ]),

        stubAlertTypes: () => Promise.all([prisonApi.stubAlertTypes()]),
        stubAlertsForBooking: (alerts) => Promise.all([prisonApi.stubAlertsForBooking(alerts)]),
        stubAlertsForLatestBooking: (alerts) => prisonApi.stubAlertsForLatestBooking(alerts),
        stubAlerts: prisonApi.stubAlerts,

        stubInmates: prisonApi.stubInmates,
        stubPSInmates: offenderSearch.stubInmates,
        stubUserLocations: prisonApi.stubUserLocations,

        stubQuickLook: ({
          offence,
          prisonerDetails,
          sentenceDetails,
          balances,
          iepSummary,
          positiveCaseNotes,
          negativeCaseNotes,
          adjudications,
          visitsSummary,
          visitBalances,
          todaysEvents,
          profileInformation,
        }) =>
          Promise.all([
            prisonApi.stubMainOffence(offence),
            prisonApi.stubPrisonerDetails(prisonerDetails),
            prisonApi.stubPrisonerSentenceDetails(sentenceDetails),
            prisonApi.stubPrisonerBalances(balances),
            incentivesApi.stubGetIepSummaryForBooking(iepSummary),
            prisonApi.stubPositiveCaseNotes(positiveCaseNotes),
            prisonApi.stubNegativeCaseNotes(negativeCaseNotes),
            prisonApi.stubAdjudicationsForBooking(adjudications),
            prisonApi.stubVisitsSummary(visitsSummary),
            prisonApi.stubPrisonerVisitBalances(visitBalances),
            prisonApi.stubEventsForToday(todaysEvents),
            prisonApi.stubProfileInformation(profileInformation),
          ]),
        stubQuickLookApiErrors: () =>
          Promise.all([
            prisonApi.stubMainOffence(null, 500),
            prisonApi.stubPrisonerDetails([], 500),
            prisonApi.stubPrisonerSentenceDetails(null, 500),
            prisonApi.stubPrisonerBalances(null, 500),
            incentivesApi.stubGetIepSummaryForBooking(null, 500),
            prisonApi.stubPositiveCaseNotes(null, 500),
            prisonApi.stubNegativeCaseNotes(null, 500),
            prisonApi.stubAdjudicationsForBooking(null, 500),
            prisonApi.stubVisitsSummary(null, 500),
            prisonApi.stubPrisonerVisitBalances(null, 500),
            prisonApi.stubEventsForToday([], 500),
            prisonApi.stubProfileInformation(null, 500),
          ]),

        stubPrisonerDetails: (prisonerDetails) => prisonApi.stubPrisonerDetails(prisonerDetails),

        stubLatestLearnerAssessments: (functionalSkillsAssessments) =>
          curiousApi.stubLatestLearnerAssessments(functionalSkillsAssessments),

        stubLearnerGoals: (learnerGoals) => curiousApi.stubLearnerGoals(learnerGoals),

        stubLearnerEducation: (learnerEducation) => curiousApi.stubLearnerEducation(learnerEducation),

        stubOffenderWorkHistory: (workHistory) => prisonApi.stubForOffenderWorkHistory(workHistory),

        stubLearnerEmployabilitySkills: (learnerEmployabilitySkills) =>
          curiousApi.stubLearnerEmployabilitySkills(learnerEmployabilitySkills),

        stubWorkAndSkillsApi500Errors: () =>
          Promise.all([
            curiousApi.stubLatestLearnerAssessments({}, 500),
            curiousApi.stubLearnerGoals({}, 500),
            curiousApi.stubLearnerEducation({}, 500),
            curiousApi.stubLearnerEmployabilitySkills([], 500),
            prisonApi.stubForOffenderWorkHistory({}, 500),
            prisonApi.stubPrisonerDetails({}, 500),
          ]),

        stubWorkAndSkillsApi404Errors: (error) =>
          Promise.all([
            curiousApi.stubLatestLearnerAssessments(error, 404),
            curiousApi.stubLearnerGoals(error, 404),
            curiousApi.stubLearnerEducation(error, 404),
            curiousApi.stubLearnerEmployabilitySkills(error, 404),
            prisonApi.stubForOffenderWorkHistory(error, 404),
            prisonApi.stubPrisonerDetails(error, 404),
          ]),

        stubLearnerNeurodiversity: (learnerNeurodiversity) =>
          curiousApi.stubLearnerNeurodiversity(learnerNeurodiversity),

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
          neurodiversities,
          neurodivergence,
        }) =>
          Promise.all([
            prisonApi.stubIdentifiers(identifiers),
            prisonApi.stubOffenderAliases(aliases),
            prisonApi.stubPrisonerProperty(property),
            prisonApi.stubPrisonerContacts(contacts),
            prisonApi.stubPrisonerAddresses(addresses),
            prisonApi.stubSecondaryLanguages(secondaryLanguages),
            prisonApi.stubPersonAddresses(personAddresses),
            prisonApi.stubPersonEmails(personEmails),
            prisonApi.stubPersonPhones(personPhones),
            prisonApi.stubTreatmentTypes(treatmentTypes),
            prisonApi.stubHealthTypes(healthTypes),
            prisonApi.stubPersonalCareNeeds(careNeeds),
            prisonApi.stubReasonableAdjustments(reasonableAdjustments),
            prisonApi.stubAgencies(agencies),
            allocationManager.stubGetPomForOffender(prisonOffenderManagers),
            curiousApi.stubLearnerProfiles(neurodiversities),
            curiousApi.stubLearnerNeurodiversity(neurodivergence),
          ]),
        stubReleaseDatesOffenderNo: (releaseDates) =>
          Promise.all([prisonApi.stubPrisonerSentenceDetails(releaseDates)]),
        stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
        stubSignInPage: auth.redirect,
        stubGetAbsences: ({ agencyId, reason, absences, reasonDescription }) =>
          whereabouts.stubGetAbsences(agencyId, reason, absences, reasonDescription),
        stubGetAbsenceReasons: whereabouts.stubGetAbsenceReasons,
        stubGetAttendance: ({ caseload, locationId, timeSlot, date, data }) =>
          Promise.all([whereabouts.stubGetAttendance(caseload, locationId, timeSlot, date, data)]),
        stubPostAttendance: (response) => whereabouts.stubPostAttendance(response),
        stubPutAttendance: (response) => whereabouts.stubPutAttendance(response),
        verifyPostAttendance: () => whereabouts.verifyPostAttendance(),
        stubSentenceAdjustments: (response) => prisonApi.stubGetSentenceAdjustments(response),
        stubMovementsBetween: prisonApi.stubMovementsBetween,
        stubOffenderBasicDetails: (basicDetails) => Promise.all([prisonApi.stubOffenderBasicDetails(basicDetails)]),
        stubOffenderFullDetails: (fullDetails) => Promise.all([prisonApi.stubOffenderFullDetails(fullDetails)]),
        stubAppointmentTypes: (types) => Promise.all([prisonApi.stubAppointmentTypes(types)]),
        stubAppointmentsAtAgency: (agency, locations) =>
          Promise.all([prisonApi.stubUsageAtAgency(agency, 'APP', locations)]),
        stubVisitsAtAgency: (agency, locations) =>
          Promise.all([prisonApi.stubUsageAtAgency(agency, 'VISIT', locations)]),
        stubActivityLocations: (status) => prisonApi.stubActivityLocations(status),
        stubPostAppointments: () => Promise.all([prisonApi.stubPostAppointments()]),
        stubSchedules: ({ agency, location, date, appointments, visits, activities }) =>
          Promise.all([
            prisonApi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments),
            prisonApi.stubSchedulesAtLocation(location, 'APP', date, appointments),
            prisonApi.stubSchedulesAtAgency(agency, location, 'VISIT', date, visits),
            prisonApi.stubSchedulesAtLocation(location, 'VISIT', date, visits),
            prisonApi.stubCourtEvents(),
            prisonApi.stubActivitySchedules(location, date, activities),
            prisonApi.stubVisits(visits),
            prisonApi.stubExternalTransfers(),
            prisonApi.stubAppointments(appointments),
            prisonApi.stubActivities(activities),
          ]),
        stubOffenderSuspendedActivitiesOverDateRange: ({ agencyId, fromDate, toDate, period, suspensions }) =>
          Promise.all([
            prisonApi.stubOffenderSuspendedActivitiesOverDateRange(agencyId, fromDate, toDate, period, suspensions),
          ]),
        stubPrisonersUnaccountedFor: whereabouts.stubPrisonersUnaccountedFor,
        stubAttendanceForBookings: ({ agencyId, fromDate, toDate, period, attendances }) =>
          whereabouts.stubAttendanceForBookings(agencyId, fromDate, toDate, period, attendances),
        stubAppointments: (appointments) => prisonApi.stubAppointments(appointments),
        stubVisits: (visits) => prisonApi.stubVisits(visits),
        stubSentenceData: (details) => prisonApi.stubSentenceData(details),
        stubLocation: ({ locationId, locationData }) => Promise.all([prisonApi.stubLocation(locationId, locationData)]),
        stubAgencyDetails: ({ agencyId, details }) => Promise.all([prisonApi.stubAgencyDetails(agencyId, details)]),
        stubLocationsForAgency: ({ agency, locations }) =>
          Promise.all([prisonApi.stubLocationsForAgency(agency, locations)]),
        stubAppointmentLocations: ({ agency, locations }) =>
          Promise.all([prisonApi.stubAppointmentLocations(agency, locations)]),
        stubBookingOffenders: (offenders) => Promise.all([prisonApi.stubBookingOffenders(offenders)]),
        stubAgencies: (agencies) => Promise.all([prisonApi.stubAgencies(agencies)]),
        stubAppointmentsAtAgencyLocation: ({ agency, location, date, appointments }) =>
          Promise.all([prisonApi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments)]),
        stubCourtCases: (courtCases) => prisonApi.stubCourtCases(courtCases),
        stubOffenceHistory: (offenceHistory) => prisonApi.stubOffenceHistory(offenceHistory),
        stubSentenceTerms: (sentenceTerms) => prisonApi.stubSentenceTerms(sentenceTerms),
        stubClientCredentialsRequest: () => auth.stubClientCredentialsRequest(),
        stubUserMe: ({ username, staffId, name }) => auth.stubUserMe(username, staffId, name),
        stubPathFinderOffenderDetails: (details) => pathfinder.getOffenderDetails(details),
        stubSocOffenderDetails: (details) => socApi.stubGetOffenderDetails(details),
        stubIsCaseLoadRestrictedPatient: (details) => restrictedPatientApi.stubIsCaseLoadRestrictedPatient(details),
        stubVisitsWithVisitors: ({ visitsWithVisitors, offenderBasicDetails }) =>
          Promise.all([
            prisonApi.stubVisitsWithVisitors(visitsWithVisitors),
            prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
            prisonApi.stubVisitsPrisons(),
            prisonApi.stubCancellationReasons(),
            prisonApi.stubCompletionReasons(),
          ]),
        stubSchedule: ({ offenderBasicDetails, thisWeeksSchedule, nextWeeksSchedule }) =>
          Promise.all([
            prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
            prisonApi.stubScheduledEventsForThisWeek(thisWeeksSchedule),
            prisonApi.stubScheduledEventsForNextWeek(nextWeeksSchedule),
          ]),
        stubAppointmentsGet: prisonApi.stubAppointmentsGet,
        stubVideoLinkAppointments: whereabouts.stubVideoLinkAppointments,
        stubCreateAlert: prisonApi.stubCreateAlert,
        stubCreateCaseNote: caseNotes.stubCreateCaseNote,
        verifySaveCaseNote: caseNotes.verifySaveCaseNote,
        stubDeleteCaseNote: caseNotes.stubDeleteCaseNote,
        stubDeleteCaseNoteAmendment: caseNotes.stubDeleteCaseNoteAmendment,
        stubCaseNoteTypesForUser: caseNotes.stubCaseNoteTypesForUser,
        stubGlobalSearch: offenderSearch.stubGlobalSearch,
        stubPrisonApiGlobalSearch: prisonApi.stubPrisonApiGlobalSearch,
        stubGlobalSearchMultiplePages: offenderSearch.stubGlobalSearchMultiplePages,
        stubOffenderImage: prisonApi.stubOffenderImage,
        verifyGlobalSearch: offenderSearch.verifyGlobalSearch,
        stubOffenderMovements: prisonApi.stubOffenderMovements,
        stubGetCaseNote: (caseNote) => caseNotes.stubGetCaseNote(caseNote),
        stubGetOffenderCaseNote: ({ offenderId, caseNoteId, caseNote }) =>
          caseNotes.stubGetOffenderCaseNote(offenderId, caseNoteId, caseNote),
        stubBookingDetails: (details) => prisonApi.stubBookingDetails(details),
        verifySaveAmendment: caseNotes.verifySaveAmendment,
        stubGetCaseNoteTypes: caseNotes.stubGetCaseNoteTypes,
        stubSaveAmendment: caseNotes.stubSaveAmendment,
        stubBookingNonAssociations: (response) => prisonApi.stubBookingNonAssociations(response),
        stubProfessionalContacts: ({
          offenderBasicDetails,
          contacts,
          personAddresses,
          personEmails,
          personPhones,
          prisonOffenderManagers,
        }) =>
          Promise.all([
            prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
            prisonApi.stubPrisonerContacts(contacts),
            prisonApi.stubPersonAddresses(personAddresses),
            prisonApi.stubPersonEmails(personEmails),
            prisonApi.stubPersonPhones(personPhones),
            allocationManager.stubGetPomForOffender(prisonOffenderManagers),
          ]),
        stubUserCaseLoads: (caseloads) => prisonApi.stubUserCaseloads(caseloads),
        stubUpdateCaseload: prisonApi.stubUpdateCaseload,
        stubCellAttributes: prisonApi.stubCellAttributes,
        stubMainOffence: (offence) => prisonApi.stubMainOffence(offence),
        stubCsraAssessments: ({ offenderNumbers, assessments }) =>
          prisonApi.stubCsraAssessments(offenderNumbers, assessments),
        stubCsraAssessmentsForPrisoner: (assessments) => prisonApi.stubCsraAssessmentsForPrisoner(assessments),
        stubCsraReviewForPrisoner: ({ bookingId, assessmentSeq, review }) =>
          prisonApi.stubCsraReviewForPrisoner({ bookingId, assessmentSeq, review }),
        stubNoExistingOffenderRecord: ({ offenderNo }) => dataComplianceApi.stubNoExistingOffenderRecord(offenderNo),
        stubRetentionRecord: ({ offenderNo, record }) => dataComplianceApi.stubRetentionRecord(offenderNo, record),
        stubGetOffenderRetentionReasons: dataComplianceApi.stubGetOffenderRetentionReasons,
        stubCreateRecord: ({ offenderNo }) => dataComplianceApi.stubCreateRecord(offenderNo),
        stubCellsWithCapacity: ({ cells }) => prisonApi.stubCellsWithCapacity(cells),
        stubCellsWithCapacityByGroupName: ({ agencyId, groupName, response }) =>
          whereabouts.stubCellsWithCapacityByGroupName({ agencyId, groupName, response }),
        stubInmatesAtLocation: ({ inmates }) => prisonApi.stubInmatesAtLocation(inmates),
        stubOffenderCellHistory: ({ history }) => prisonApi.stubOffenderCellHistory(history),
        stubGetAlerts: ({ agencyId, alerts }) => prisonApi.stubGetAlerts({ agencyId, alerts }),
        stubGetAlert: ({ bookingId, alertId, alert }) => prisonApi.stubGetAlert({ bookingId, alertId, alert }),
        stubPutAlert: ({ bookingId, alertId, alert }) => prisonApi.stubPutAlert({ bookingId, alertId, alert }),
        stubPutAlertErrors: ({ bookingId, alertId, alert, status }) =>
          prisonApi.stubPutAlert({
            bookingId,
            alertId,
            alert,
            status,
          }),
        stubHistoryForLocation: (locationHistory) => prisonApi.stubHistoryForLocation(locationHistory),
        stubAttributesForLocation: (locationAttributes) => prisonApi.stubAttributesForLocation(locationAttributes),
        stubPrisonerDetail: ({ prisonerDetail, bookingId }) => prisonApi.stubPrisonerDetail(prisonerDetail, bookingId),
        stubPrisonerFullDetail: ({ prisonerDetail, offenderNo, fullInfo }) =>
          prisonApi.stubPrisonerFullDetail(prisonerDetail, offenderNo, fullInfo),
        stubMoveToCell: () => whereabouts.stubMoveToCell(),
        stubMoveToCellSwap: () => prisonApi.stubMoveToCellSwap(),
        verifyMoveToCell: (body) => prisonApi.verifyMoveToCell(body),
        stubGetLocationPrefix: ({ agencyId, groupName, response }) =>
          whereabouts.stubGetLocationPrefix({ agencyId, groupName, response }),
        verifyMoveToCellSwap: ({ bookingId }) => prisonApi.verifyMoveToCellSwap({ bookingId }),
        stubAttendanceStats: ({ agencyId, fromDate, period, stats }) =>
          whereabouts.stubAttendanceStats(agencyId, fromDate, period, stats),
        stubEstablishmentRollCount: ({ agencyId, assignedMovements, unassignedMovements, movements, enroute }) =>
          Promise.all([
            prisonApi.stubAssignedMovements(agencyId, assignedMovements),
            prisonApi.stubUnassignedMovements(agencyId, unassignedMovements),
            prisonApi.stubRollcountByType(agencyId, 'movements', movements),
            prisonApi.stubRollcountByType(agencyId, 'enroute', enroute),
          ]),
        stubCourtEvents: (courtEvents) => prisonApi.stubCourtEvents(courtEvents),
        stubGetEventsByLocationIds: ({ agencyId, date, timeSlot, response }) =>
          prisonApi.stubGetEventsByLocationIds(agencyId, date, timeSlot, response),
        stubExternalTransfers: (response) => prisonApi.stubExternalTransfers(response),
        stubAssessments: (offenderNumbers) => prisonApi.stubAssessments(offenderNumbers),
        stubGetAgencyGroupLocations: ({ agencyId, groupName, response }) =>
          whereabouts.stubGetAgencyGroupLocations({ agencyId, groupName, response }),
        stubLocationGroups: (locationGroups) => whereabouts.stubLocationGroups(locationGroups),
        stubActivityLocationsByDateAndPeriod: ({ locations, date, period, withFault }) =>
          prisonApi.stubActivityLocationsByDateAndPeriod(locations, date, period, withFault),
        stubActivityLocationsConnectionResetFault: () => prisonApi.stubActivityLocationsConnectionResetFault(),
        stubGetAttendancesForBookings: ({ agencyId, timeSlot, date, data }) =>
          whereabouts.stubGetAttendancesForBookings(agencyId, timeSlot, date, data),
        stubGetAdjudicationDetails: (adjudicationDetails) => prisonApi.stubGetAdjudicationDetails(adjudicationDetails),
        stubAdjudicationFindingTypes: (types) => prisonApi.stubAdjudicationFindingTypes(types),
        stubAdjudications: ({ response, headers }) => prisonApi.stubAdjudications(response, headers),
        verifyAdjudicationsHistory: ({ offenderNo, agencyId, finding, fromDate, toDate }) =>
          prisonApi.verifyAdjudicationsHistory({ offenderNo, agencyId, finding, fromDate, toDate }),
        verifyAlertsBooking: ({ bookingId, alertType, from, to, alertStatus, page, sort, size }) =>
          prisonApi.verifyAlertsBookingGet({ bookingId, alertType, from, to, alertStatus, page, sort, size }),
        resetAdjudicationsStub: () => prisonApi.resetAdjudicationsStub(),
        stubConvictions: ({ offenderNo, convictions }) => community.stubConvictions(offenderNo, convictions),
        stubOffenderDetails: ({ offenderNo, details }) => community.stubOffenderDetails(offenderNo, details),
        stubDocuments: ({ offenderNo, documents }) => community.stubDocuments(offenderNo, documents),
        stubDocument: ({ offenderNo, documentId, content }) => community.stubDocument(offenderNo, documentId, content),
        stubGetIepSummaryForBooking: (iepSummary) => incentivesApi.stubGetIepSummaryForBooking(iepSummary),
        stubMovementsIn: ({ agencyId, fromDate, movements }) =>
          prisonApi.stubMovementsIn({ agencyId, fromDate, movements }),
        stubMovementsOut: ({ agencyId, fromDate, movements }) =>
          prisonApi.stubMovementsOut({ agencyId, fromDate, movements }),
        stubGetIepSummaryForBookingIds: (body) => incentivesApi.stubGetIepSummaryForBookingIds(body),
        stubSystemAlerts: prisonApi.stubSystemAlerts,
        stubInReception: ({ agencyId, results }) => prisonApi.stubRollcountByType(agencyId, 'in-reception', results),
        stubEnRoute: ({ agencyId, results }) => prisonApi.stubEnRoute(agencyId, results),
        stubCurrentlyOut: ({ livingUnitId, movements }) => prisonApi.stubCurrentlyOut(livingUnitId, movements),
        stubTotalCurrentlyOut: ({ agencyId, movements }) => prisonApi.stubTotalCurrentlyOut(agencyId, movements),
        stubGetAgencyIepLevels: (response) => incentivesApi.stubGetAgencyIepLevels(response),
        stubChangeIepLevel: (body) => incentivesApi.stubChangeIepLevel(body),
        stubGetPrisonerDamageObligations: (response) => prisonApi.stubGetPrisonerDamageObligations(response),
        stubGetTransactionHistory: ({ response, accountCode, transactionType, fromDate, toDate }) =>
          prisonApi.stubGetTransactionHistory({ response, accountCode, transactionType, fromDate, toDate }),
        stubPrisonerBalances: (response) => prisonApi.stubPrisonerBalances(response),
        stubGetCellMoveReason: ({ bookingId, bedAssignmentHistorySequence, cellMoveReason, status }) =>
          whereabouts.stubGetCellMoveReason(bookingId, bedAssignmentHistorySequence, cellMoveReason, status),
        stubGetStaffDetails: ({ staffId, response }) => prisonApi.stubGetStaffDetails(staffId, response),
        stubStaffRoles: (response) => prisonApi.stubStaffRoles(response),
        stubLocationConfig: ({ agencyId, response }) => whereabouts.stubLocationConfig({ agencyId, response }),
        stubGetDetailsFailure: ({ status }) => prisonApi.stubGetDetailsFailure(status),
        stubGetPrisoners: (response) => prisonApi.stubGetPrisoners(response),
        stubGetUserDetailsList: (response) => Promise.all([prisonApi.stubGetUserDetailsList(response)]),
        stubGetComplexOffenders: (offenders) => complexity.stubGetComplexOffenders(offenders),
        stubCellMoveHistory: ({ assignmentDate, agencyId, cellMoves }) =>
          prisonApi.stubCellMoveHistory({ assignmentDate, agencyId, cellMoves }),
        stubKeyworkerMigrated: () => keyworker.stubKeyworkerMigrated(),
        stubGetWhereaboutsAppointments: (appointments) => whereabouts.stubGetWhereaboutsAppointments(appointments),
        stubCreateAppointment: () => whereabouts.stubCreateAppointment(),
        stubGetAppointment: ({ appointment, id, status }) =>
          whereabouts.stubGetAppointment({ appointment, id, status }),
        stubDeleteAppointment: ({ id, status }) => whereabouts.stubDeleteAppointment({ id, status }),
        stubDeleteRecurringAppointmentSequence: ({ id, status }) =>
          whereabouts.stubDeleteRecurringAppointmentSequence({ id, status }),
        stubGetUnacceptableAbsenceCount: (args) => whereabouts.stubGetUnacceptableAbsenceCount(args),
        stubGetUnacceptableAbsenceDetail: (args) => whereabouts.stubGetUnacceptableAbsenceDetail(args),
        stubPrisonerSearch: (response) => offenderSearch.stubPrisonerSearch(response),
        stubPrisonerSearchDetails: (response) => offenderSearch.stubPrisonerSearchDetails(response),
      })
    },

    baseUrl: 'http://localhost:3008',
    specPattern: 'integration-tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration-tests/support/index.js',
  },
})
