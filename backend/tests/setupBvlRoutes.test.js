/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
const express = require('express')
const request = require('supertest')
const config = require('../config')
const bvlRoutes = require('../setupBvlRoutes')
const nunjucksSetup = require('../utils/nunjucksSetup')

const prisonApi = jest.fn()
const whereaboutsApi = jest.fn()
const oauthApi = jest.fn()
const notifyClient = jest.fn()
const logError = jest.fn()

const createApp = redirect => {
  config.app.featureFlags.redirectToBookingVideoLinkEnabled = redirect
  const app = express()
  nunjucksSetup(app)
  app.use((req, res, next) => {
    // @ts-ignore
    req.session = { userDetails: { name: 'someName' } }
    next()
  })

  app.use(bvlRoutes({ prisonApi, whereaboutsApi, oauthApi, notifyClient, logError }))
  return app
}

describe('Test setupBvlRoutes for redirects', () => {
  it('GET "/videolink" redirect = true, app redirects to http://localhost:3000', async () => {
    const app = createApp(true)
    await request(app)
      .get('/videolink')
      .expect('location', 'http://localhost:3000')
      .expect(302)
  })
})
