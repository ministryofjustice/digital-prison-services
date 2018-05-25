const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getActivityList(req, res);
  res.json(viewModel);
}));

const getActivityList = (async (req, res) => {
  req.query.usage = 'PROD';
  const activities = await elite2Api.getActivityList(req, res).data;
  req.query.usage = 'VISIT';
  const visits = await elite2Api.getActivityList(req, res).data;
  req.query.usage = 'APP';
  const appointments = await elite2Api.getActivityList(req, res).data;

  for (const row of activities) {
    row.visits = visits.filter(details => details.offenderNo === row.offenderNo);
    row.appointments = appointments.filter(details => details.offenderNo === row.offenderNo);
  }
  return activities;
});

module.exports = { router, getActivityList };
