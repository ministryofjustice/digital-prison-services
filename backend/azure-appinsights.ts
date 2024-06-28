import * as appInsights from 'applicationinsights'
import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { Contracts } from 'applicationinsights'
import applicationVersion from './application-version'
import ignoreNotFoundErrors from './telemetryProcessors/ignoreNotFound'

const { packageData, buildNumber } = applicationVersion

export type ContextObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any
}

export default (() => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
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

export function addUserDataToRequests(envelope: EnvelopeTelemetry, contextObjects: ContextObject): boolean {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username, activeCaseLoad } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
<<<<<<< Updated upstream
=======
    const referer = contextObjects?.['http.ServerRequest']?.req?.headers?.referer

>>>>>>> Stashed changes
    if (username) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        activeCaseLoadId: activeCaseLoad.caseLoadId,
        ...properties,
      }
    }
  }
  return true
}
