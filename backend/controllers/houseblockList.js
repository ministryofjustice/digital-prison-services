const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const log = require('../log');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getHouseblockList(req, res);
  res.json(viewModel);
}));

const getHouseblockList = (async (req, res) => {
  const events = await elite2Api.getHouseblockList(req, res);
  // Returns array ordered by inmate/cell (group order), then get act, visit, app

  log.info(events.data, 'getHouseblockList data received');
  const rows = {};
  const data = events.data;
  for (const item of data) {
    if (!rows[item.offenderNo]) {
      rows[item.offenderNo] = [];
    }
    rows[item.offenderNo].push(item);
  }
  return rows;
});

module.exports = { router, getHouseblockList };
