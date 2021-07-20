/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
const bodyParser = require('body-parser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'session'.
const session = require('express-session')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'flash'.
const flash = require('connect-flash')
const setCookie = require('set-cookie-parser')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sessionMan... Remove this comment to see the full error message
const sessionManagementRoutes = require('../sessionManagementRoutes')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auth'.
const auth = require('../auth')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')

const hmppsCookieName = 'testCookie'

const hasCookies = (expectedNames) => (res) => {
  const cookieNames = setCookie.parse(res).map((cookie) => cookie.name)
  expect(cookieNames).toEqual(expect.arrayContaining(expectedNames))
}

config.app.url = 'https://digital.prison.url/'

describe('Test the routes and middleware installed by sessionManagementRoutes', () => {
  const app = express()

  app.set('view engine', 'njk')
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use(
    session({
      name: hmppsCookieName,
      resave: false,
      saveUninitialized: false,
      secret: 'secret',
      cookie: {
        maxAge: 1 * 60 * 1000,
        secure: false,
        signed: true,
      },
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  auth.init()

  /**
   * A Token refresher that does nothing.
   * @returns {Promise<void>}
   */
  const tokenRefresher = jest.fn()

  sessionManagementRoutes.configureRoutes({
    app,
    tokenRefresher,
    mailTo: 'test@site.com',
  })

  // some content to send for '/'
  app.get('/', (req, res) => {
    res.send('static')
  })

  // Create an agent.  The agent handles and sends cookies. (It has state). The order of test below is important
  // because the outcome of each test depends upon the successful completion of the previous tests.
  const agent = request.agent(app)

  it('GET "/" with no cookie (not authenticated) redirects to /login', () =>
    agent.get('/').expect(302).expect('location', '/login?returnTo=%2F'))

  it('GET "/some-page" with no cookie (not authenticated) redirects to /login?returnTo=some-page', () =>
    agent.get('/some-page').expect(302).expect('location', '/login?returnTo=%2Fsome-page'))

  it('GET "/login" when not authenticated returns login page', () => agent.get('/login').expect(302))

  it('GET "/heart-beat"', () => agent.get('/heart-beat').set('Accept', 'application/json').expect(401))

  it('GET "/logout" clears the cookie', () =>
    agent
      .get('/auth/logout')
      .expect(302)
      .expect(
        'location',
        'http://localhost:9090/auth/logout?client_id=prisonapiclient&redirect_uri=https://digital.prison.url/'
      ))

  it('After logout get "/" should redirect to "/login"', () =>
    agent.get('/').expect(302).expect('location', '/login?returnTo=%2F').expect(hasCookies([])))
})
