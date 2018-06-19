
const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const switchDateFormat = require('../utils');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getActivityList(req, res);
  res.json(viewModel);
}));

const getActivityList = async (req, res) => {
  // once request is not used passed to downstream services we wont have to manipulate it in this dodgy way
  switchDateFormat(req);
  // if (!req.query) {
  //   req.query = {};
  // }
  req.query.usage = 'PROG';
  const resp1 = await elite2Api.getActivityList(req, res);
  const activities = resp1.data;
  req.query.usage = 'VISIT';
  const resp2 = await elite2Api.getActivityList(req, res);
  const visits = resp2.data;
  req.query.usage = 'APP';
  const resp3 = await elite2Api.getActivityList(req, res);
  const appointments = resp3.data;

  if (activities) {
    for (const row of activities) {
      if (visits) {
        row.visits = visits.filter(details => details.offenderNo === row.offenderNo);
      }
      if (appointments) {
        row.appointments = appointments.filter(details => details.offenderNo === row.offenderNo);
      }
    }
  }
  return activities;
};

module.exports = { router, getActivityList };
