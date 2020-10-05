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

  const getVisitsForBookingWithVisitors = (context, bookingId, params) =>
    get(context, `/api/bookings/${bookingId}/visits-with-visitors?${mapToQueryString(params)}`)

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

  const getAlertsForBooking = (context, { bookingId, query }, headers) => {
    contextProperties.setCustomRequestHeaders(context, headers)
    return get(context, `/api/bookings/${bookingId}/alerts${query}`)
  }

  const getAlertsSystem = (context, offenderNumbers) =>
    post(context, '/api/bookings/offenderNo/alerts', offenderNumbers)

  const getAssessments = (context, { code, offenderNumbers }) =>
    post(context, `/api/offender-assessments/${code}`, offenderNumbers)

  const getCsraAssessments = (context, offenderNumbers) =>
    post(context, `/api/offender-assessments/csra/list`, offenderNumbers)

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

  const getMovementsInBetween = (context, agencyId, params) =>
    get(context, `/api/movements/${agencyId}/in?${mapToQueryString(params)}`)

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

  const getAdjudications = async (context, offenderNumber, params, pageOffset, pageLimit) => {
    contextProperties.setCustomRequestHeaders(context, {
      'page-offset': pageOffset || 0,
      'page-limit': pageLimit || 10,
    })

    const response = await get(
      context,
      `/api/offenders/${offenderNumber}/adjudications${params && `?${mapToQueryString(params)}`}`
    )

    return {
      ...response,
      pagination: {
        pageOffset: context.responseHeaders['page-offset'],
        pageLimit: context.responseHeaders['page-limit'],
        totalRecords: context.responseHeaders['total-records'],
      },
    }
  }

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

  const getOffenderAliases = (context, bookingId) => get(context, `/api/bookings/${bookingId}/aliases`)

  const getPhysicalAttributes = (context, bookingId) => get(context, `/api/bookings/${bookingId}/physicalAttributes`)

  const getPhysicalCharacteristics = (context, bookingId) =>
    get(context, `/api/bookings/${bookingId}/physicalCharacteristics`)

  const getPhysicalMarks = (context, bookingId) => get(context, `/api/bookings/${bookingId}/physicalMarks`)

  const getScheduledActivities = (context, { agencyId, eventIds }) =>
    post(context, `/api/schedules/${agencyId}/activities-by-event-ids`, eventIds)

  const getImage = (context, imageId) => getStream(context, `/api/images/${imageId}/data`)

  const getPrisonerProperty = (context, bookingId) => get(context, `/api/bookings/${bookingId}/property`)

  const getPrisonerDetail = (context, bookingId) => get(context, `/api/bookings/${bookingId}`)

  const getPrisonerContacts = (context, bookingId) => get(context, `/api/bookings/${bookingId}/contacts`)

  const getPersonAddresses = (context, personId) => get(context, `/api/persons/${personId}/addresses`)

  const getPersonEmails = (context, personId) => get(context, `/api/persons/${personId}/emails`)

  const getPersonPhones = (context, personId) => get(context, `/api/persons/${personId}/phones`)

  const getInmates = (context, locationId, params) =>
    get(context, `/api/locations/description/${locationId}/inmates?${mapToQueryString(params)}`)

  const getInmatesAtLocation = (context, locationId, params) =>
    get(context, `/api/locations/${locationId}/inmates?${mapToQueryString(params)}`)

  const getInmatesAtLocationPrefix = (context, locationPrefix) =>
    get(context, `/api/locations/description/${locationPrefix}/inmates`, 1000)

  const getProfileInformation = (context, bookingId) => get(context, `/api/bookings/${bookingId}/profileInformation`)

  const getSecondaryLanguages = (context, bookingId) => get(context, `/api/bookings/${bookingId}/secondary-languages`)

  const getPrisonerAddresses = (context, offenderNo) => get(context, `/api/offenders/${offenderNo}/addresses`)

  const getPersonalCareNeeds = (context, bookingId, types) =>
    get(context, `/api/bookings/${bookingId}/personal-care-needs?type=${types}`)

  const getReasonableAdjustments = (context, bookingId, types) =>
    get(context, `/api/bookings/${bookingId}/reasonable-adjustments?type=${types}`)

  const getTreatmentTypes = context => get(context, '/api/reference-domains/domains/HEALTH_TREAT', 1000)

  const getHealthTypes = context => get(context, '/api/reference-domains/domains/HEALTH', 1000)

  const getVisitTypes = context => get(context, '/api/reference-domains/domains/VISIT_TYPE', 1000)

  const getCellAttributes = context => get(context, '/api/reference-domains/domains/HOU_UNIT_ATT', 1000)

  const getSentenceAdjustments = (context, bookingId) => get(context, `/api/bookings/${bookingId}/sentenceAdjustments`)

  const getCourtCases = (context, bookingId) => get(context, `/api/bookings/${bookingId}/court-cases`)

  const getOffenceHistory = (context, offenderNo) =>
    get(context, `/api/bookings/offenderNo/${offenderNo}/offenceHistory`)

  const getSentenceTerms = (context, bookingId) =>
    get(
      context,
      `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`
    )

  const getScheduledEventsForThisWeek = (context, bookingId) =>
    get(context, `/api/bookings/${bookingId}/events/thisWeek`)

  const getScheduledEventsForNextWeek = (context, bookingId) =>
    get(context, `/api/bookings/${bookingId}/events/nextWeek`)

  const getNonAssociations = (context, bookingId) => get(context, `/api/bookings/${bookingId}/non-association-details`)

  const getCellsWithCapacity = (context, agencyId, attribute) =>
    get(
      context,
      attribute
        ? `/api/agencies/${agencyId}/cellsWithCapacity?attribute=${attribute}`
        : `/api/agencies/${agencyId}/cellsWithCapacity`
    )

  const getOffenderCellHistory = (context, bookingId, params) =>
    get(context, `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`)

  const getAttributesForLocation = (context, locationId) => get(context, `/api/cell/${locationId}/attributes`)

  const getHistoryForLocation = (context, { locationId, fromDate, toDate }) =>
    get(context, `/api/cell/${locationId}/history?fromDate=${fromDate}&toDate=${toDate}`)

  const moveToCell = (context, { bookingId, internalLocationDescription, reasonCode }) =>
    put(
      context,
      `/api/bookings/${bookingId}/living-unit/${internalLocationDescription}?reasonCode=${reasonCode || 'ADM'}`
    )

  const moveToCellSwap = (context, { bookingId }) => put(context, `/api/bookings/${bookingId}/move-to-cell-swap`, {})

  return {
    userLocations,
    userCaseLoads,
    setActiveCaseload,
    getHouseblockList,
    getActivityList,
    searchActivityLocations,
    getVisits,
    getVisitsForBookingWithVisitors,
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
    getAlertsForBooking,
    getAlertsSystem,
    getAssessments,
    getEstablishmentRollBlocksCount,
    getEstablishmentRollMovementsCount,
    getEstablishmentRollEnrouteCount,
    getInmates,
    getPrisonerImage,
    getLastPrison,
    getMovementsIn,
    getMovementsInBetween,
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
    getOffenderAliases,
    getPhysicalAttributes,
    getPhysicalCharacteristics,
    getPhysicalMarks,
    getImage,
    getPrisonerProperty,
    getPrisonerDetail,
    getPrisonerContacts,
    getPersonAddresses,
    getPersonEmails,
    getPersonPhones,
    getProfileInformation,
    getPrisonerAddresses,
    getSecondaryLanguages,
    getPersonalCareNeeds,
    getReasonableAdjustments,
    getTreatmentTypes,
    getHealthTypes,
    getVisitTypes,
    getSentenceAdjustments,
    getCourtCases,
    getOffenceHistory,
    getSentenceTerms,
    getScheduledEventsForThisWeek,
    getScheduledEventsForNextWeek,
    getNonAssociations,
    getCellAttributes,
    getCellsWithCapacity,
    getCsraAssessments,
    getOffenderCellHistory,
    getAttributesForLocation,
    getHistoryForLocation,
    getInmatesAtLocation,
    getInmatesAtLocationPrefix,
    moveToCell,
    moveToCellSwap,
  }
}

module.exports = { elite2ApiFactory }
