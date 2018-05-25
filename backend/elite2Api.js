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

const getHouseblockList = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: req.query.date ?
    `${eliteApiUrl}api/schedules/${req.query.agencyId}/groups/${req.query.groupName}?date=${req.query.date}&timeSlot=${req.query.timeSlot}` :
    `${eliteApiUrl}api/schedules/${req.query.agencyId}/groups/${req.query.groupName}?timeSlot=${req.query.timeSlot}`
});

const getActivityList = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: req.query.date ?
    `${eliteApiUrl}api/schedules/${req.query.agencyId}/locations/${req.query.locationId}/usage/${req.query.usage}?date=${req.query.date}&timeSlot=${req.query.timeSlot}` :
    `${eliteApiUrl}api/schedules/${req.query.agencyId}/locations/${req.query.locationId}/usage/${req.query.usage}?timeSlot=${req.query.timeSlot}`
});

const searchLocations = (req, res) => gateway.getRequest({
  req,
  res,
  method: 'get',
  url: `${eliteApiUrl}api/agencies/${req.query.agencyId}/locations`
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
  searchLocations,
  searchGroups
};

function encodeQueryString (input) {
  return encodeURIComponent(input);
}

module.exports = service;
