const express = require('express');
const router = express.Router();
const moment = require('moment');
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const log = require('../log');

router.put('/', asyncMiddleware(async (req, res) => {
  await updateAttendance(req, res);
  res.json({});
}));

const updateAttendance = (async (req, res) => {
  if (!req || !req.query || !req.query.offenderNo || !req.query.activityId) {
    throw new Error("Offender or activity id missing");
  }
  const { offenderNo, activityId } = req.query;
  await elite2Api.updateAttendance(req, { offenderNo, activityId }, res);
  log.info(res.status, 'updateAttendance success');
  if (req.body.eventOutcome === 'UNACAB' && req.body.performance === 'UNACCEPT') {
    req.body = {
      type: 'Negative Behaviour',
      subType: 'IEP Warning',
      occurrenceDateTime: moment().format('YYYY-MM-DDThh:mm'),
      text: 'Refused to attend activity / education.'
    };
    await elite2Api.createCaseNote(req, res);
    log.info(res.status, 'casenote created');
  }
});

module.exports = { router, updateAttendance };
