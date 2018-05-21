const log = require('../log');

module.exports = function ensureSec (req, res, next) {
  if (req.secure) {
    return next();
  }
  const redirectUrl = "https://" + req.hostname + req.url;
  log.info(`Redirecting to ${redirectUrl}`);

  res.redirect(redirectUrl);
};
