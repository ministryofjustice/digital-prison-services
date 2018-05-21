const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/asyncHandler');
const config = require('../config');

router.get('/', asyncMiddleware(async (req, res) => {
  // be careful not to return All config values
  res.json({
    notmEndpointUrl: config.app.notmEndpointUrl,
    mailTo: config.app.mailTo,
    googleAnalyticsId: config.analytics.googleAnalyticsId
  });
}));

module.exports = router;
