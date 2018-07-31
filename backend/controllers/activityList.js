const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const switchDateFormat = require('../utils');
const log = require('../log');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getActivityList(req, res);
  res.json(viewModel);
}));

const getActivityList = async (req, res) => {
  let { agencyId, locationId, date, timeSlot } = req.query;
  date = switchDateFormat(date);

  const sortFields = ['event_description', 'lastName'];
  const activities = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'PROG', date, timeSlot, sortFields }, res);
  log.info(activities.data, 'getActivityList data received');
  const visits = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'VISIT', date, timeSlot }, res);
  const appointments = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'APP', date, timeSlot }, res);

  if (activities.data) {
    for (const row of activities.data) {
      if (visits.data) {
        row.visits = visits.data.filter(details => details.offenderNo === row.offenderNo);
      }
      if (appointments.data) {
        row.appointments = appointments.data.filter(details => details.offenderNo === row.offenderNo);
      }
    }
  }
  return activities.data;
};

module.exports = { router, getActivityList };
