const contextProperties = require('../contextProperties')
const { arrayToQueryString, mapToQueryString } = require('../utils')

const elite2ApiFactory = client => {
  const processResponse = context => response => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url, resultsLimit) => client.get(context, url, resultsLimit).then(processResponse(context))

  const getStream = (context, url) => client.getStream(context, url)

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const put = (context, url, data) => client.put(context, url, data).then(processResponse(context))

  const userLocations = context => (context.authSource !== 'auth' ? get(context, '/api/users/me/locations') : [])
  const userCaseLoads = context => (context.authSource !== 'auth' ? get(context, '/api/users/me/caseLoads') : [])

  // NB. This function expects a caseload object.
  // The object *must* have non-blank caseLoadId,  description and type properties.
  // However, only 'caseLoadId' has meaning.  The other two properties can take *any* non-blank value and these will be ignored.
  const setActiveCaseload = (context, caseload) => put(context, '/api/users/me/activeCaseLoad', caseload)

  const getHouseblockList = (context, agencyId, locationIds, date, timeSlot) =>
    post(context, `/api/schedules/${agencyId}/events-by-location-ids?date=${date}&timeSlot=${timeSlot}`, locationIds)

  const getActivityList = (context, { agencyId, locationId, usage, date, timeSlot }) =>
    get(
      context,
      `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?${
        timeSlot ? `timeSlot=${timeSlot}&` : ''
      }date=${date}`
    )

  const getActivitiesAtLocation = (context, { locationId, date, timeSlot, includeSuspended = false }) =>
    get(
      context,
      `/api/schedules/locations/${locationId}/activities?${
        timeSlot ? `timeSlot=${timeSlot}&` : ''
      }date=${date}&includeSuspended=${includeSuspended}`
    )

  const getVisits = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(
      context,
      `/api/schedules/${agencyId}/visits?${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}`,
      offenderNumbers
    )

  const getNextVisit = (context, bookingId) => get(context, `/api/bookings/${bookingId}/visits/next`)

  const getAppointments = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(
      context,
      `/api/schedules/${agencyId}/appointments?${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}`,
      offenderNumbers
    )

  const getAppointmentsForAgency = (context, { agencyId, date, locationId, timeSlot }) => {
    const searchParams = mapToQueryString({
      date,
      locationId,
      timeSlot,
    })

    return get(context, `/api/schedules/${agencyId}/appointments?${searchParams}`)
  }

  const getActivities = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(
      context,
      `/api/schedules/${agencyId}/activities?${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}`,
      offenderNumbers
    )

  const getAgencies = context => get(context, '/api/agencies/prison')

  const getAgencyDetails = (context, agencyId) => get(context, `/api/agencies/${agencyId}?activeOnly=false`)

  const getAgencyIepLevels = (context, agencyId) => get(context, `/api/agencies/${agencyId}/iepLevels`)

  const getStaffDetails = (context, staffId) => get(context, `/api/users/${staffId}`)

  const getCourtEvents = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `/api/schedules/${agencyId}/courtEvents?date=${date}`, offenderNumbers)

  const getExternalTransfers = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `/api/schedules/${agencyId}/externalTransfers?date=${date}`, offenderNumbers)
  // TODO can refactor these alerts calls later to just use the system one once the client id is established in env

  const getAlerts = (context, { agencyId, offenderNumbers }) =>
    post(context, `/api/bookings/offenderNo/${agencyId}/alerts`, offenderNumbers)

  const getAlertsSystem = (context, offenderNumbers) =>
    post(context, '/api/bookings/offenderNo/alerts', offenderNumbers)

  const getAssessments = (context, { code, offenderNumbers }) =>
    post(context, `/api/offender-assessments/${code}`, offenderNumbers)

  const getEstablishmentRollBlocksCount = (context, agencyId, unassigned) =>
    get(context, `/api/movements/rollcount/${agencyId}?unassigned=${unassigned}`)

  const getEstablishmentRollMovementsCount = (context, agencyId) =>
    get(context, `/api/movements/rollcount/${agencyId}/movements`)

  const getEstablishmentRollEnrouteCount = (context, agencyId) =>
    get(context, `/api/movements/rollcount/${agencyId}/enroute`)

  const searchActivityLocations = (context, agencyId, bookedOnDay, timeSlot) =>
    get(context, `/api/agencies/${agencyId}/eventLocationsBooked?bookedOnDay=${bookedOnDay}&timeSlot=${timeSlot}`)

  const getSentenceData = (context, offenderNumbers) => post(context, `/api/offender-sentences`, offenderNumbers)

  const getPrisonerImage = (context, offenderNo, fullSizeImage = false) =>
    getStream(context, `/api/bookings/offenderNo/${offenderNo}/image/data?fullSizeImage=${fullSizeImage}`)

  const globalSearch = (context, params, resultsLimit) => {
    const { offenderNo, lastName, firstName, gender, location, dateOfBirth, includeAliases } = params

    const searchParams = mapToQueryString({
      offenderNo,
      lastName,
      firstName,
      gender,
      location,
      dob: dateOfBirth,
      partialNameMatch: false,
      includeAliases,
    })
    return get(context, `/api/prisoners?${searchParams}`, resultsLimit)
  }
  const getLastPrison = (context, body) => post(context, `/api/movements/offenders`, body)

  const getRecentMovements = (context, body, movementTypes) =>
    post(
      context,
      `/api/movements/offenders${movementTypes && `?${arrayToQueryString(movementTypes, 'movementTypes')}`}`,
      body
    )

  const getMovementsIn = (context, agencyId, movementDate) =>
    get(context, `/api/movements/${agencyId}/in/${movementDate}`)

  const getMovementsOut = (context, agencyId, movementDate) =>
    get(context, `/api/movements/${agencyId}/out/${movementDate}`)

  const getOffendersInReception = (context, agencyId) =>
    get(context, `/api/movements/rollcount/${agencyId}/in-reception`)

  const getIepSummary = (context, bookings) =>
    get(context, `/api/bookings/offenders/iepSummary?${arrayToQueryString(bookings, 'bookings')}`)

  const getIepSummaryForBooking = (context, bookingId, withDetails) =>
    get(context, `/api/bookings/${bookingId}/iepSummary?withDetails=${withDetails}`)

  const getDetails = (context, offenderNo, fullInfo = false) =>
    get(context, `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}`)

  const getOffendersCurrentlyOutOfLivingUnit = (context, livingUnitId) =>
    get(context, `/api/movements/livingUnit/${livingUnitId}/currently-out`)

  const getOffendersCurrentlyOutOfAgency = (context, agencyId) =>
    get(context, `/api/movements/agency/${agencyId}/currently-out`)

  const getLocation = (context, livingUnitId) => get(context, `/api/locations/${livingUnitId}`)

  const getOffendersEnRoute = (context, agencyId) => get(context, `/api/movements/${agencyId}/enroute`)

  const getBasicInmateDetailsForOffenders = (context, offenders) => post(context, `/api/bookings/offenders`, offenders)

  const getLocationsForAppointments = (context, agencyId) =>
    get(context, `/api/agencies/${agencyId}/locations?eventType=APP`)

  const getAppointmentTypes = context => get(context, '/api/reference-domains/scheduleReasons?eventType=APP')

  const getAdjudicationFindingTypes = context => get(context, '/api/reference-domains/domains/OIC_FINDING', 1000)

  const getAdjudications = (context, offenderNumber, params) =>
    get(context, `/api/offenders/${offenderNumber}/adjudications${params && `?${mapToQueryString(params)}`}`)

  const getAdjudicationDetails = (context, offenderNumber, adjudicationNumber) =>
    get(context, `/api/offenders/${offenderNumber}/adjudications/${adjudicationNumber}`)

  const getAdjudicationsForBooking = (context, bookingId) => get(context, `/api/bookings/${bookingId}/adjudications`)

  const addAppointments = (context, body) => post(context, '/api/appointments', body)

  const addSingleAppointment = (context, bookingId, body) =>
    post(context, `/api/bookings/${bookingId}/appointments`, body)

  const changeIepLevel = (context, bookingId, body) => post(context, `/api/bookings/${bookingId}/iepLevels`, body)

  const getOffenderActivities = (context, { agencyId, date, period }) =>
    get(context, `/api/schedules/${agencyId}/activities?date=${date}&timeSlot=${period}`)

  const getOffenderActivitiesOverDateRange = (context, { agencyId, fromDate, toDate, period }) =>
    get(
      context,
      `/api/schedules/${agencyId}/activities-by-date-range?fromDate=${fromDate}&toDate=${toDate}&timeSlot=${period}&includeSuspended=true`
    )

  const getAlertTypes = context => get(context, '/api/reference-domains/alertTypes', 1000)

  const createAlert = (context, bookingId, body) => post(context, `/api/bookings/${bookingId}/alert`, body)

  const getAlert = (context, bookingId, alertId) => get(context, `/api/bookings/${bookingId}/alerts/${alertId}`)

  const updateAlert = (context, bookingId, alertId, body) =>
    put(context, `/api/bookings/${bookingId}/alert/${alertId}`, body)

  const getOffenderSummaries = (context, offenderNo) =>
    get(context, `/api/bookings?${arrayToQueryString(offenderNo, 'offenderNo')}`, 100)

  const getCaseNoteSummaryByTypes = (context, params) =>
    get(context, `/api/case-notes/summary?${mapToQueryString(params)}`)

  const getMainOffence = (context, bookingId) => get(context, `/api/bookings/${bookingId}/mainOffence`)

  const getStaffRoles = (context, staffId, agencyId) => get(context, `/api/staff/${staffId}/${agencyId}/roles`)

  const getPrisonerBalances = (context, bookingId) => get(context, `/api/bookings/${bookingId}/balances`)

  const getPrisonerDetails = (context, offenderNo) => get(context, `/api/prisoners/${offenderNo}`)

  const getPrisonerSentenceDetails = (context, offenderNo) => get(context, `/api/offenders/${offenderNo}/sentences`)

  const getPositiveCaseNotes = (context, bookingId, fromDate, toDate) =>
    get(context, `/api/bookings/${bookingId}/caseNotes/POS/IEP_ENC/count?fromDate=${fromDate}&toDate=${toDate}`)

  const getNegativeCaseNotes = (context, bookingId, fromDate, toDate) =>
    get(context, `/api/bookings/${bookingId}/caseNotes/NEG/IEP_WARN/count?fromDate=${fromDate}&toDate=${toDate}`)

  const getPrisonerVisitBalances = (context, offenderNo) =>
    get(context, `/api/bookings/offenderNo/${offenderNo}/visit/balances`)

  const getEventsForToday = (context, bookingId) => get(context, `/api/bookings/${bookingId}/events/today`)

  const getIdentifiers = (context, bookingId) => get(context, `/api/bookings/${bookingId}/identifiers`)

  const getScheduledActivities = (context, { agencyId, eventIds }) =>
    post(context, `/api/schedules/${agencyId}/activities-by-event-ids`, eventIds)

  return {
    userLocations,
    userCaseLoads,
    setActiveCaseload,
    getHouseblockList,
    getActivityList,
    searchActivityLocations,
    getVisits,
    getNextVisit,
    getAppointments,
    getAppointmentsForAgency,
    getActivities,
    getAgencies,
    getAgencyDetails,
    getAgencyIepLevels,
    getStaffDetails,
    getCourtEvents,
    getSentenceData,
    globalSearch,
    getExternalTransfers,
    getAlerts,
    getAlertsSystem,
    getAssessments,
    getEstablishmentRollBlocksCount,
    getEstablishmentRollMovementsCount,
    getEstablishmentRollEnrouteCount,
    getPrisonerImage,
    getLastPrison,
    getMovementsIn,
    getMovementsOut,
    getOffendersInReception,
    getRecentMovements,
    getIepSummary,
    getIepSummaryForBooking,
    getDetails,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getLocation,
    getOffendersEnRoute,
    getBasicInmateDetailsForOffenders,
    getLocationsForAppointments,
    getAppointmentTypes,
    getAdjudicationFindingTypes,
    getAdjudications,
    getAdjudicationDetails,
    getAdjudicationsForBooking,
    addAppointments,
    changeIepLevel,
    getOffenderActivities,
    getAlertTypes,
    createAlert,
    getAlert,
    updateAlert,
    getOffenderSummaries,
    getOffenderActivitiesOverDateRange,
    getActivitiesAtLocation,
    addSingleAppointment,
    getCaseNoteSummaryByTypes,
    getMainOffence,
    getStaffRoles,
    getPrisonerBalances,
    getPrisonerDetails,
    getPrisonerSentenceDetails,
    getPositiveCaseNotes,
    getNegativeCaseNotes,
    getPrisonerVisitBalances,
    getEventsForToday,
    getIdentifiers,
    getScheduledActivities,
  }
}

module.exports = { elite2ApiFactory }
