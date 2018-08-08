
const elite2ApiFactory = (client) => {
  const processResponse = (context) => (response) => {
    return response.data;
  };

  const get = (context, url, resultsLimit) =>
    client
      .get(context, url, resultsLimit)
      .then(processResponse(context));

  const post = (context, url, data) =>
    client
      .post(context, url, data)
      .then(processResponse(context));

  const put = (context, url, data) =>
    client
      .put(context, url, data)
      .then(processResponse(context));

  const userLocations = (context) => get(context, 'api/users/me/locations');
  const currentUser = (context) => get(context, 'api/users/me');
  const userCaseLoads = (context) => get(context, 'api/users/me/caseLoads');

  // NB. This function expects a caseload object.
  // The object *must* have non-blank caseLoadId,  description and type properties.
  // However, only 'caseLoadId' has meaning.  The other two properties can take *any* non-blank value and these will be ignored.
  // TODO: Tech Debt: This might be better expressed as a PUT of the desired active caseload id to users/me/activeCaseloadId
  const setActiveCaseload = (context, caseload) => put(context, 'api/users/me/activeCaseLoad', caseload);

  const getHouseblockList = (context, agencyId, groupName, date, timeSlot) => get(context, `api/schedules/${agencyId}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}`);
  const getActivityList = (context, { agencyId, locationId, usage, date, timeSlot }) => get(context, `api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?date=${date}&timeSlot=${timeSlot}`);
  const getVisits = (context, { agencyId, locationId, date, timeSlot, offenderNumbers }) => post(context, `api/schedules/${agencyId}/visits?timeSlot=${timeSlot}&date=${date}`, offenderNumbers);
  const getAppointments = (context, { agencyId, locationId, date, timeSlot, offenderNumbers }) => post(context, `api/schedules/${agencyId}/appointments?timeSlot=${timeSlot}&date=${date}`, offenderNumbers);

  const searchActivityLocations = (context, agencyId) => get(context, `api/agencies/${agencyId}/locations?eventType=APP`);
  const searchGroups = (context, agencyId) => get(context, `api/agencies/${agencyId}/locations/groups`);
  const updateAttendance = (context, offenderNo, activityId, body) => put(context, `api/bookings/offenderNo/${offenderNo}/activities/${activityId}/attendance`, body);
  const createCaseNote = (context, offenderNo, body) => post(context, `api/bookings/offenderNo/${offenderNo}/caseNotes`, body);

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
    getAppointments
  };
};

module.exports = { elite2ApiFactory };
