import { SpanKind } from '@ministryofjustice/hmpps-azure-telemetry'
import type { SpanFilterFn } from '@ministryofjustice/hmpps-azure-telemetry'

const ignoreNotFoundErrors: SpanFilterFn = span => {
  const statusCode = span.attributes['http.response.status_code'] ?? span.attributes['http.status_code']
  return !(span.kind === SpanKind.CLIENT && String(statusCode) === '404')
}

export default ignoreNotFoundErrors
