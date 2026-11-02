import './bootstrap'

import { initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import applicationVersion from './application-version'
import ignoreNotFoundErrors from './telemetryProcessors/ignoreNotFound'

const { packageData, buildNumber } = applicationVersion

initialiseTelemetry({
  serviceName: packageData.name,
  serviceVersion: buildNumber,
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(ignoreNotFoundErrors)
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

export default telemetry
