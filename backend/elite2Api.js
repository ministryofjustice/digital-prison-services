/* eslint-disable no-unused-vars */
const gateway = require('./gateway-api');

const eliteApiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/';

const login = (req) => gateway.login(req);

const userLocations = (req, res) => gateway.getRequest({
  req,
  res,
  url: `${eliteApiUrl}api/users/me/locations`
});

const currentUser = (req, res) => gateway.getRequest({
  req,
  res,
  url: `${eliteApiUrl}api/users/me`
});

const userCaseLoads = (req, res) => gateway.getRequest({
  req,
  res,
  url: `${eliteApiUrl}api/users/me/caseLoads`
});

const setActiveCaseLoad = (req, res) => gateway.putRequest({
  req,
  res,
  url: `${eliteApiUrl}api/users/me/activeCaseLoad`
});

function getSortHeaders (req) {
  const fields = req.headers['sort-fields'];
  const order = req.headers['sort-order'];
  if (fields) {
    return { 'Sort-Fields': fields, 'Sort-Order': order };
  }
  return undefined;
}

const getHouseblockList = (req, res) => gateway.getRequest({
  req,
  res,
  headers: getSortHeaders(req),
  params: { date: req.query.date, timeSlot: req.query.timeSlot },
  url: `${eliteApiUrl}api/schedules/${req.query.agencyId}/groups/${req.query.groupName}`
});

const getActivityList = (req, { agencyId, locationId, usage, date, timeSlot }, res) => gateway.getRequest({
  req,
  res,
  headers: getSortHeaders(req),
  params: { date, timeSlot },
  url: `${eliteApiUrl}api/schedules/${agencyId}/locations/${locationId}/usage/${usage}`
});

const searchActivityLocations = (req, res) => gateway.getRequest({
  req,
  res,
  url: `${eliteApiUrl}api/agencies/${req.query.agencyId}/locations?eventType=APP`
});

const searchGroups = (req, res) => gateway.getRequest({
  req,
  res,
  url: `${eliteApiUrl}api/agencies/${req.query.agencyId}/locations/groups`
});

const updateAttendance = (req, { offenderNo, activityId }, res) => gateway.putRequest({
  req,
  res,
  // eventOutcome, performance, outcomeComment in req.body
  url: `${eliteApiUrl}api/bookings/offenderNo/${offenderNo}/activities/${activityId}/attendance`
});

const createCaseNote = (req, res) => gateway.postRequest({
  req,
  res,
  url: `${eliteApiUrl}api/bookings/offenderNo/${req.query.offenderNo}/caseNotes`
});

const service = {
  login,
  currentUser,
  userCaseLoads,
  userLocations,
  setActiveCaseLoad,
  eliteApiUrl,
  getHouseblockList,
  getActivityList,
  searchActivityLocations,
  searchGroups,
  updateAttendance,
  createCaseNote
};

function encodeQueryString (input) {
  return encodeURIComponent(input);
}

module.exports = service;
