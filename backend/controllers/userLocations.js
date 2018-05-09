const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');

router.get('/', asyncMiddleware(async (req, res) => {
  const response = await elite2Api.userLocations(req, res);
  res.json(response.data);
}));

module.exports = router;
