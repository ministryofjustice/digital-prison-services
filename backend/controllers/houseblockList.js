/* eslint-disable no-lonely-if */
const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const log = require('../log');
const switchDateFormat = require('../utils');
const moment = require('moment');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getHouseblockList(req, res);
  res.json(viewModel);
}));

const getHouseblockList = (async (req, res) => {
  // once request is not used passed to downstream services we wont have to manipulate it in this dodgy way
  req.query.date = switchDateFormat(req.query.date);

  const events = await elite2Api.getHouseblockList(req, res);
  // Returns array ordered by inmate/cell or name, then start time

  log.info(events.data, 'getHouseblockList data received');
  const rows = [];
  const data = events.data;
  let i = -1;
  let lastOffenderNo = '';
  for (const event of data) {
    if (event.offenderNo !== lastOffenderNo) {
      i++;
      lastOffenderNo = event.offenderNo;
      rows[i] = {};
    }

    let currentRow = rows[i];
    if (event.eventType === 'PRISON_ACT') {
      if (!currentRow.activity) {
        currentRow.activity = event;
      } else if (moment(event.startTime).isBefore(currentRow.activity.startTime)) {
        //we discard any duplicate activities and only display the earliest in the time period
        currentRow.activity = event;
      } else {
        log.info(`Multiple paid activities in same time period. \nOffender: ${event.offenderNo}, Cell location: ${event.cellLocation}, Event desc: ${event.eventDescription}, Starttime: ${event.startTime}`);
      }
    } else {
      // set array of non-paid appointments or visits
      if (!currentRow.others) {
        currentRow.others = [event];
      } else {
        currentRow.others.push(event);
      }
    }
  }
  return rows;
}
);


module.exports = { router, getHouseblockList };
