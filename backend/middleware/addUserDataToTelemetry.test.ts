/** @jest-environment node */
import express from 'express'
import supertest from 'supertest'
import { trace } from '@ministryofjustice/hmpps-azure-telemetry'
import addUserDataToTelemetry from './addUserDataToTelemetry'

describe('addUserDataToTelemetry', () => {
  const span = trace.getTracer('test').startSpan('request')
  const setAttribute = jest.spyOn(span, 'setAttribute')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  const enrich = (user, headers = {}) => {
    const app = express()
    app.use((req, res, next) => {
      res.locals.user = user
      next()
    })
    app.use(addUserDataToTelemetry)
    app.get('/', (req, res) => res.sendStatus(200))
    return supertest(app).get('/').set(headers).expect(200)
  }

  it('preserves username, nested caseload and referer attributes', async () => {
    await enrich({ username: 'test-user', activeCaseLoad: { caseLoadId: 'LII' } }, { referer: 'https://some-site.com' })

    expect(setAttribute).toHaveBeenCalledWith('username', 'test-user')
    expect(setAttribute).toHaveBeenCalledWith('activeCaseLoadId', 'LII')
    expect(setAttribute).toHaveBeenCalledWith('referer', 'https://some-site.com')
    expect(setAttribute).toHaveBeenCalledTimes(3)
  })

  it('omits absent caseload and referer', async () => {
    await enrich({ username: 'test-user' })

    expect(setAttribute).toHaveBeenCalledWith('username', 'test-user')
    expect(setAttribute).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, {}, { activeCaseLoad: { caseLoadId: 'LII' } }])(
    'continues without adding legacy metadata when username is absent: %j',
    async user => {
      await enrich(user, { referer: 'https://some-site.com' })

      expect(setAttribute).not.toHaveBeenCalled()
    },
  )
})
