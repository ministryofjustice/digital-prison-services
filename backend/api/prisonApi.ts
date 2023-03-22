import contextProperties from '../contextProperties'
import { arrayToQueryString, mapToQueryString } from '../utils'

export type GetTransferParameters = {
  courtEvents: boolean
  releaseEvents: boolean
  transferEvents: boolean
  fromDateTime: string
  toDateTime: string
  agencyId: string
}

export type PrisonerPersonalPropertyLocation = {
  agencyId: string
  currentOccupancy: number
  description: string
  internalLocationCode: string
  locationId: number
  locationPrefix: string
  locationType: string
  locationUsage: string
  operationalCapacity: number
  parentLocationId: number
  userDescription: string
}

export type PrisonerPersonalProperty = {
  containerType: string
  location: PrisonerPersonalPropertyLocation
  sealMark: string
}

export type AlertDetails = {
  alertCode: string
  alertCodeDescription: string
  comment?: string
  dateCreated: string
  addedByFirstName: string
  addedByLastName: string
}

export type CaseLoad = {
  caseLoadId: string
  description: string
  currentlyActive: boolean
}

export type Location = {
  locationPrefix: string
  description: string
  locationId: number
  locationType: string
  locationUsage: string
  agencyId: string
  parentLocationId: number
  currentOccupancy: number
  operationalCapacity: number
  userDescription: string
  internalLocationCode: string
}

export const prisonApiFactory = (client) => {
  const processResponse = (context) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url, resultsLimit?, retryOverride?) =>
    client.get(context, url, { resultsLimit, retryOverride }).then(processResponse(context))

  const map404ToNull = (error) => {
    if (!error.response) throw error
    if (!error.response.status) throw error
    if (error.response.status !== 404) throw error
    return null
  }
  const getWithHandle404 = (context, url, resultsLimit?, retryOverride?) =>
    client.get(context, url, { resultsLimit, retryOverride }).then(processResponse(context)).catch(map404ToNull)

  const getWithCustomTimeout = (context, path, overrides) =>
    client.getWithCustomTimeout(context, path, overrides).then(processResponse(context))

  const getStream = (context, url) => client.getStream(context, url)

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const put = (context, url, data) => client.put(context, url, data).then(processResponse(context))

  const userLocations = (context): [Location] =>
    context.authSource !== 'auth' ? get(context, '/api/users/me/locations') : []
  const userCaseLoads = (context): [CaseLoad] =>
    context.authSource !== 'auth' ? get(context, '/api/users/me/caseLoads') : []

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

  const getVisitsSummary = (context, bookingId) => get(context, `/api/bookings/${bookingId}/visits/summary`)

  const getVisitsPrisons = (context, bookingId) => get(context, `/api/bookings/${bookingId}/visits/prisons`)

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

  const getPrisons = (context) => get(context, '/api/agencies/type/INST')

  const getAgencyDetails = (context, agencyId) => get(context, `/api/agencies/${agencyId}?activeOnly=false`)

  const getStaffDetails = (context, staffId) => getWithHandle404(context, `/api/users/${staffId}`)

  const getCourtEvents = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `/api/schedules/${agencyId}/courtEvents?date=${date}`, offenderNumbers)

  const getExternalTransfers = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `/api/schedules/${agencyId}/externalTransfers?date=${date}`, offenderNumbers)
  // TODO can refactor these alerts calls later to just use the system one once the client id is established in env

  const getAlerts = (context, { agencyId, offenderNumbers }) =>
    post(context, `/api/bookings/offenderNo/${agencyId}/alerts`, offenderNumbers)

  const getAlertsForBookingV2 = (context, { bookingId, alertType, from, to, alertStatus, page, sort, size }) => {
    return get(
      context,
      `/api/bookings/${bookingId}/alerts/v2?alertType=${alertType}&from=${from}&to=${to}&alertStatus=${alertStatus}&page=${page}&sort=${sort}&size=${size}`
    )
  }

  const getAlertsForLatestBooking = (context, { offenderNo, alertCodes, sortBy, sortDirection }): Array<AlertDetails> =>
    get(
      context,
      `/api/offenders/${offenderNo}/bookings/latest/alerts?alertCodes=${alertCodes.toString()}&sort=${sortBy}&direction=${sortDirection}`
    )

  const getAlertsSystem = (context, offenderNumbers) =>
    post(context, '/api/bookings/offenderNo/alerts', offenderNumbers)

  const getAssessments = (context, { code, offenderNumbers }) =>
    post(context, `/api/offender-assessments/${code}`, offenderNumbers)

  const getCsraAssessments = (context, offenderNumbers) =>
    post(context, `/api/offender-assessments/csra/list`, offenderNumbers)

  const getCsraAssessmentsForPrisoner = (context, offenderNumber) =>
    get(context, `/api/offender-assessments/csra/${offenderNumber}`)

  const getCsraReviewForBooking = (context, bookingId, assessmentSeq) =>
    get(context, `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`)

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

  const getDetails = (context, offenderNo, fullInfo = false) =>
    get(context, `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}&csraSummary=${fullInfo}`)

  const getOffendersCurrentlyOutOfLivingUnit = (context, livingUnitId) =>
    get(context, `/api/movements/livingUnit/${livingUnitId}/currently-out`)

  const getOffendersCurrentlyOutOfAgency = (context, agencyId) =>
    get(context, `/api/movements/agency/${agencyId}/currently-out`)

  const getLocation = (context, livingUnitId) => get(context, `/api/locations/${livingUnitId}`)

  const getOffendersEnRoute = (context, agencyId) => get(context, `/api/movements/${agencyId}/enroute`)

  const getBasicInmateDetailsForOffenders = (context, offenders) => post(context, `/api/bookings/offenders`, offenders)

  const getLocationsForAgency = (context, agencyId) => get(context, `/api/agencies/${agencyId}/locations`)

  const getLocationsForAppointments = (context, agencyId) =>
    get(context, `/api/agencies/${agencyId}/locations?eventType=APP`)

  const getAppointmentTypes = (context) => get(context, '/api/reference-domains/scheduleReasons?eventType=APP')

  const getAdjudicationFindingTypes = (context) => get(context, '/api/reference-domains/domains/OIC_FINDING', 1000)

  const getMovementReasons = (context) => get(context, '/api/reference-domains/domains/MOVE_RSN', 1000)

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

  const getOffenderSuspendedActivitiesOverDateRange = (context, { agencyId, fromDate, toDate, period }) =>
    get(
      context,
      `/api/schedules/${agencyId}/suspended-activities-by-date-range?fromDate=${fromDate}&toDate=${toDate}&timeSlot=${period}&includeSuspended=true`
    )

  const getAlertTypes = (context) => get(context, '/api/reference-domains/alertTypes', 1000)

  const createAlert = (context, bookingId, body) => post(context, `/api/bookings/${bookingId}/alert`, body)

  const getAlert = (context, bookingId, alertId) => get(context, `/api/bookings/${bookingId}/alerts/${alertId}`)

  const updateAlert = (context, bookingId, alertId, body) =>
    put(context, `/api/bookings/${bookingId}/alert/${alertId}`, body)

  const getOffenderSummaries = (context, offenderNo) => {
    return get(context, `/api/bookings/v2?${arrayToQueryString(offenderNo, 'offenderNo')}&size=100`)
  }
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
    get(context, `/api/bookings/offenderNo/${offenderNo}/visit/balances?allowNoContent=true`)

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

  const getPrisonerProperty = (context, bookingId: number): Array<PrisonerPersonalProperty> =>
    get(context, `/api/bookings/${bookingId}/property`)

  const getPrisonerDetail = (context, bookingId) => get(context, `/api/bookings/${bookingId}`)

  const getPrisonerContacts = (context, bookingId) => get(context, `/api/bookings/${bookingId}/contacts`)

  const getPersonAddresses = (context, personId) => get(context, `/api/persons/${personId}/addresses`)

  const getPersonEmails = (context, personId) => get(context, `/api/persons/${personId}/emails`)

  const getPersonPhones = (context, personId) => get(context, `/api/persons/${personId}/phones`)

  const getInmates = (context, locationId, params) =>
    get(context, `/api/locations/description/${locationId}/inmates?${mapToQueryString(params)}`)

  const getLocationDetails = (context, locationId) => get(context, `/api/locations/${locationId}`)

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

  const getTreatmentTypes = (context) => get(context, '/api/reference-domains/domains/HEALTH_TREAT', 1000)

  const getHealthTypes = (context) => get(context, '/api/reference-domains/domains/HEALTH', 1000)

  const getCellAttributes = (context) => get(context, '/api/reference-domains/domains/HOU_UNIT_ATT', 1000)

  const getCellMoveReasonTypes = (context) => get(context, '/api/reference-domains/domains/CHG_HOUS_RSN', 1000)

  const getVisitCompletionReasons = (context) => get(context, '/api/reference-domains/domains/VIS_COMPLETE', 1000)
  const getVisitCancellationReasons = (context) => get(context, '/api/reference-domains/domains/MOVE_CANC_RS', 1000)

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

  const getHistoryByDate = (context, { assignmentDate, agencyId }) =>
    get(context, `/api/cell/${agencyId}/history/${assignmentDate}`)

  const moveToCellSwap = (context, { bookingId }) => put(context, `/api/bookings/${bookingId}/move-to-cell-swap`, {})

  const getOffenderDamageObligations = (context, offenderNo) =>
    get(context, `/api/offenders/${offenderNo}/damage-obligations`)

  const getTransactionHistory = (context, offenderNo, params) =>
    get(context, `/api/offenders/${offenderNo}/transaction-history?${mapToQueryString(params)}`)

  const getPrisoners = (context, searchCriteria) => post(context, `/api/prisoners`, searchCriteria)

  const getUserDetailsList = (context, users) => post(context, `/api/users/list`, users)

  const getOffenderActivitiesHistory = (context, offenderNo, earliestEndDate, params) =>
    get(
      context,
      `/api/offender-activities/${offenderNo}/activities-history?earliestEndDate=${earliestEndDate}&${mapToQueryString(
        params
      )}`
    )

  const getTransfers = (context, parameters: GetTransferParameters) =>
    getWithCustomTimeout(context, `/api/movements/transfers?${new URLSearchParams(parameters as never).toString()}`, {
      customTimeout: 30000,
    })

  return {
    userLocations,
    userCaseLoads,
    setActiveCaseload,
    getHouseblockList,
    getActivityList,
    searchActivityLocations,
    getVisits,
    getVisitsForBookingWithVisitors,
    getVisitsSummary,
    getVisitsPrisons,
    getAppointments,
    getAppointmentsForAgency,
    getActivities,
    getPrisons,
    getAgencyDetails,
    getStaffDetails,
    getCourtEvents,
    getSentenceData,
    globalSearch,
    getExternalTransfers,
    getAlerts,
    getAlertsForBookingV2,
    getAlertsForLatestBooking,
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
    getDetails,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getLocation,
    getOffendersEnRoute,
    getBasicInmateDetailsForOffenders,
    getLocationsForAgency,
    getLocationsForAppointments,
    getAppointmentTypes,
    getAdjudicationFindingTypes,
    getAdjudications,
    getAdjudicationDetails,
    getAdjudicationsForBooking,
    addAppointments,
    getAlertTypes,
    createAlert,
    getAlert,
    updateAlert,
    getOffenderSummaries,
    getOffenderSuspendedActivitiesOverDateRange,
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
    getSentenceAdjustments,
    getCourtCases,
    getOffenceHistory,
    getSentenceTerms,
    getScheduledEventsForThisWeek,
    getScheduledEventsForNextWeek,
    getNonAssociations,
    getCellAttributes,
    getCellMoveReasonTypes,
    getCellsWithCapacity,
    getCsraAssessments,
    getCsraAssessmentsForPrisoner,
    getCsraReviewForBooking,
    getOffenderCellHistory,
    getAttributesForLocation,
    getHistoryForLocation,
    getLocationDetails,
    getInmatesAtLocation,
    getInmatesAtLocationPrefix,
    moveToCellSwap,
    getOffenderDamageObligations,
    getTransactionHistory,
    getPrisoners,
    getUserDetailsList,
    getHistoryByDate,
    getOffenderActivitiesHistory,
    getMovementReasons,
    getTransfers,
    getVisitCompletionReasons,
    getVisitCancellationReasons,
  }
}

export default { prisonApiFactory }
