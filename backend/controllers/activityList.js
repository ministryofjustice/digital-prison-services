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

const getActivitiesGroupedByEventThenByLastName = (data) => {
  const groupedByEvent = data.reduce((previous, current) => {
    if (previous[current.comment]) {
      previous[current.comment].push(current);
    } else {
      previous[current.comment] = [current];
    }

    return previous;
  }, {});

  const keys = Object.keys(groupedByEvent).sort();

  if (keys.length) {
    keys.forEach(key => {
      const event = groupedByEvent[key];
      event.sort((a, b) => {
        if (a.lastName < b.lastName) return -1;
        if (a.lastName > b.lastName) return 1;
        return 0;
      });
    });

    return keys.map(key => groupedByEvent[key]).reduce((previous, current) => current.concat(previous), []);
  }

  return null;
};
const getActivityList = async (req, res) => {
  let { agencyId, locationId, date, timeSlot } = req.query;
  date = switchDateFormat(date);

  const sortFields = ['event', 'lastName'];
  const activities = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'PROG', date, timeSlot, sortFields }, res);
  log.info(activities.data, 'getActivityList data received');
  const visits = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'VISIT', date, timeSlot }, res);
  const appointments = await elite2Api.getActivityList(req, { agencyId, locationId, usage: 'APP', date, timeSlot }, res);

  const grouped = getActivitiesGroupedByEventThenByLastName(activities.data);
  if (grouped) {
    activities.data = grouped;
  }
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
