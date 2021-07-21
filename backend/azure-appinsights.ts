import * as appInsights from 'applicationinsights'
import applicationVersion from './application-version'
import ignoreNotFoundErrors from './telemetryProcessors/ignoreNotFound'

const { packageData, buildNumber } = applicationVersion

export default (() => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')
    appInsights.setup().setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()
    appInsights.defaultClient.context.tags['ai.cloud.role'] = packageData.name
    appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
    appInsights.defaultClient.addTelemetryProcessor(ignoreNotFoundErrors)
    return appInsights.defaultClient
  }
  return null
})()
