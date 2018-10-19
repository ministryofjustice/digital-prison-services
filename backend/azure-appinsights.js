if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require('applicationinsights');
  // eslint-disable-next-line no-console
  console.log("Enabling azure application insights");
  appInsights.setup().start();
  module.exports = appInsights.defaultClient;
} else {
  module.exports = null;
}
