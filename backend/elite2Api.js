/* eslint-disable no-unused-vars */
const gateway = require('./gateway-api');

const eliteApiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/';

const login = (req) => gateway.login(req);

const userLocations = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/users/me/locations`
});

const currentUser = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/users/me`
});

const userCaseLoads = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/users/me/caseLoads`
});

const setActiveCaseLoad = (req, res) => gateway.putRequest({
  req,
  res,
  method: 'put',
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
  method: 'get',
  url: `${eliteApiUrl}api/schedules/${req.query.agencyId}/groups/${req.query.groupName}`
});

const getActivityList = (req, res) => gateway.getRequest({
  req,
  res,
  params: { date: req.query.date, timeSlot: req.query.timeSlot },
  method: 'get',
  url: `${eliteApiUrl}api/schedules/${req.query.agencyId}/locations/${req.query.locationId}/usage/${req.query.usage}`
});

const searchActivityLocations = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/agencies/${req.query.agencyId}/locations?eventType=APP`
});

const searchGroups = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/agencies/${req.query.agencyId}/locations/groups`
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
  searchGroups
};

function encodeQueryString (input) {
  return encodeURIComponent(input);
}

module.exports = service;
