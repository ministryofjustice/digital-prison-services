const contextProperties = require('../contextProperties')

const elite2ApiFactory = client => {
  const processResponse = context => response => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.data
  }

  const get = (context, url, resultsLimit) => client.get(context, url, resultsLimit).then(processResponse(context))

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const put = (context, url, data) => client.put(context, url, data).then(processResponse(context))

  const userLocations = context => get(context, 'api/users/me/locations')
  const currentUser = context => get(context, 'api/users/me')
  const userCaseLoads = context => get(context, 'api/users/me/caseLoads')

  // NB. This function expects a caseload object.
  // The object *must* have non-blank caseLoadId,  description and type properties.
  // However, only 'caseLoadId' has meaning.  The other two properties can take *any* non-blank value and these will be ignored.
  // TODO: Tech Debt: This might be better expressed as a PUT of the desired active caseload id to users/me/activeCaseloadId
  const setActiveCaseload = (context, caseload) => put(context, 'api/users/me/activeCaseLoad', caseload)

  const getHouseblockList = (context, agencyId, groupName, date, timeSlot) =>
    get(context, `api/schedules/${agencyId}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}`)
  const getActivityList = (context, { agencyId, locationId, usage, date, timeSlot }) =>
    get(context, `api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?date=${date}&timeSlot=${timeSlot}`)
  const getVisits = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(context, `api/schedules/${agencyId}/visits?timeSlot=${timeSlot}&date=${date}`, offenderNumbers)
  const getAppointments = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(context, `api/schedules/${agencyId}/appointments?timeSlot=${timeSlot}&date=${date}`, offenderNumbers)
  const getActivities = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(context, `api/schedules/${agencyId}/activities?timeSlot=${timeSlot}&date=${date}`, offenderNumbers)
  const getCourtEvents = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `api/schedules/${agencyId}/courtEvents?date=${date}`, offenderNumbers)
  const getExternalTransfers = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `api/schedules/${agencyId}/externalTransfers?date=${date}`, offenderNumbers)
  const getEstablishmentRollBlocksCount = (context, agencyId, unassigned) =>
    get(context, `api/movements/rollcount/${agencyId}?unassigned=${unassigned}`)
  const getEstablishmentRollMovementsCount = (context, agencyId) =>
    get(context, `api/movements/rollcount/${agencyId}/movements`)

  const searchActivityLocations = (context, agencyId, bookedOnDay, timeSlot) =>
    get(context, `api/agencies/${agencyId}/eventLocationsBooked?bookedOnDay=${bookedOnDay}&timeSlot=${timeSlot}`)
  const searchGroups = (context, agencyId) => get(context, `api/agencies/${agencyId}/locations/groups`)
  const updateAttendance = (context, offenderNo, activityId, body) =>
    put(context, `api/bookings/offenderNo/${offenderNo}/activities/${activityId}/attendance`, body)
  const createCaseNote = (context, offenderNo, body) =>
    post(context, `api/bookings/offenderNo/${offenderNo}/caseNotes`, body)

  const getSentenceData = (context, offenderNumbers) => post(context, `api/offender-sentences`, offenderNumbers)
  const globalSearch = (context, offenderNo, lastName, firstName) =>
    get(
      context,
      `api/prisoners?offenderNo=${offenderNo}&lastName=${lastName}&firstName=${firstName}&partialNameMatch=false`
    )

  return {
    userLocations,
    currentUser,
    userCaseLoads,
    setActiveCaseload,
    getHouseblockList,
    getActivityList,
    searchActivityLocations,
    searchGroups,
    updateAttendance,
    createCaseNote,
    getVisits,
    getAppointments,
    getActivities,
    getCourtEvents,
    getSentenceData,
    globalSearch,
    getExternalTransfers,
    getEstablishmentRollBlocksCount,
    getEstablishmentRollMovementsCount,
  }
}

module.exports = { elite2ApiFactory }
