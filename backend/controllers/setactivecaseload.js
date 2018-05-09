const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');

router.put('/', asyncMiddleware(async (req, res) => {
  await elite2Api.setActiveCaseLoad(req, res);
  res.json({});
}));

module.exports = router;
