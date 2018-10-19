const appInsights = require('applicationinsights');

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  // eslint-disable-next-line no-console
  console.log("Enabling azure application insights");
  appInsights.setup().start();
  module.exports = appInsights.defaultClient;
} else {
  module.exports = null;
}
