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
        currentRow.activity = [event];
      } else {
        currentRow.activity.push(event);
        currentRow.activity.sort(function (a, b) {
          return safeTimeCompare(a, b);
        });
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

function safeTimeCompare (a, b) {
  if (a.startTime && b.startTime) {
    return moment(b.startTime).isBefore(a.startTime);
  } else {
    return !a.startTime;
  }
}


module.exports = { router, getHouseblockList };
