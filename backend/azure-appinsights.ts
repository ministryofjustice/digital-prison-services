import type { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import applicationVersion from './application-version'
import ignoreNotFoundErrors from './telemetryProcessors/ignoreNotFound'

const { packageData, buildNumber } = applicationVersion

export type ContextObject = {
  [name: string]: any
}

export default (() => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // Load only when telemetry is enabled; Application Insights v3 includes ESM dependencies that Jest cannot parse.
    // eslint-disable-next-line global-require
    const appInsights = require('applicationinsights') as typeof import('applicationinsights')
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')
    appInsights.setup().setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()
    appInsights.defaultClient.context.tags['ai.cloud.role'] = packageData.name
    appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
    appInsights.defaultClient.addTelemetryProcessor(ignoreNotFoundErrors)
    appInsights.defaultClient.addTelemetryProcessor(addUserDataToRequests)
    return appInsights.defaultClient
  }
  return null
})()

export function addUserDataToRequests(envelope: TelemetryItem, contextObjects: ContextObject): boolean {
  const isRequest = envelope.data?.baseType === 'RequestData'
  if (isRequest) {
    const { username, activeCaseLoad } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    const referer = contextObjects?.['http.ServerRequest']?.req?.headers?.referer

    if (username) {
      const { properties } = envelope.data.baseData || {}
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        activeCaseLoadId: activeCaseLoad.caseLoadId,
        ...(referer && { referer }),
        ...properties,
      }
    }
  }
  return true
}
