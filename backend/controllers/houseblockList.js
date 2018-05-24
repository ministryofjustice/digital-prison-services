const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getHouseblockList(req, res);
  res.json(viewModel);
}));

const getHouseblockList = (async (req, res) => {
  req.query.usage = 'PROD';
  const activities = await elite2Api.getHouseblockList(req, res).data;
  req.query.usage = 'VISIT';
  const visits = await elite2Api.getHouseblockList(req, res).data;
  req.query.usage = 'APP';
  const appointments = await elite2Api.getHouseblockList(req, res).data;

  for (const row of activities) {
    row.visits = visits.filter(details => details.offenderNo === row.offenderNo);
    row.appointments = appointments.filter(details => details.offenderNo === row.offenderNo);
  }
  /*
  ${eliteApiUrl}api/schedules/${req.query.agencyId}/locations/${req.query.locationId}/usage/${req.query.usage}?date=${req.query.date}&timeSlot=${req.query.timeSlot}`
   */

  return activities;
});

module.exports = { router, getHouseblockList };
