const appInsights = require('applicationinsights')
const applicationVersion = require('./application-version')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ignoreNotF... Remove this comment to see the full error message
const ignoreNotFoundErrors = require('./telemetryProcessors/ignoreNotFound')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'packageDat... Remove this comment to see the full error message
const { packageData, buildNumber } = applicationVersion
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  // eslint-disable-next-line no-console
  console.log('Enabling azure application insights')
  appInsights.setup().setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()
  module.exports = appInsights.defaultClient
  appInsights.defaultClient.context.tags['ai.cloud.role'] = packageData.name
  appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
  appInsights.defaultClient.addTelemetryProcessor(ignoreNotFoundErrors)
} else {
  module.exports = null
}
