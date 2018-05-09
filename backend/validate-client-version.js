const log = require('./log');
const buildNumber = require('./application-version').buildNumber;

module.exports = function (req, res, next) {
  const sessionData = req.session;
  if (!sessionData) {
    next();
    return;
  }
  const clientVersion = sessionData.applicationVersion;
  if (!clientVersion) {
    next();
    return;
  }

  if (clientVersion !== buildNumber) {
    res.status(205); // http reset content
    log.info(`Detected client using out of date version ${clientVersion}, current is ${buildNumber}`);
    res.end();
    return;
  }

  next();
};
