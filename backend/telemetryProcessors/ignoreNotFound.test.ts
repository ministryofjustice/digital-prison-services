/** @jest-environment node */
import { SpanKind } from '@ministryofjustice/hmpps-azure-telemetry'
import type { SpanInfo } from '@ministryofjustice/hmpps-azure-telemetry'
import ignoreNotFoundErrors from './ignoreNotFound'

const createSpan = (attributes: SpanInfo['attributes'], kind = SpanKind.CLIENT): SpanInfo => ({
  name: 'GET /documents',
  kind,
  attributes,
  durationMs: 1,
  status: { code: 0 },
})

describe('Ignore outgoing HTTP NotFound spans', () => {
  it.each([404, '404'])('drops outgoing 404 spans with status %s', status => {
    expect(ignoreNotFoundErrors(createSpan({ 'http.status_code': status }))).toBe(false)
    expect(ignoreNotFoundErrors(createSpan({ 'http.response.status_code': status }))).toBe(false)
  })

  it('retains incoming 404 requests', () => {
    expect(ignoreNotFoundErrors(createSpan({ 'http.status_code': 404 }, SpanKind.SERVER))).toBe(true)
  })

  it('retains non-HTTP spans and other response codes', () => {
    expect(ignoreNotFoundErrors(createSpan({}))).toBe(true)
    expect(ignoreNotFoundErrors(createSpan({ 'http.status_code': 200 }))).toBe(true)
    expect(ignoreNotFoundErrors(createSpan({ 'http.status_code': 500 }))).toBe(true)
    expect(ignoreNotFoundErrors(createSpan({ 'http.status_code': 404 }, SpanKind.INTERNAL))).toBe(true)
  })
})
