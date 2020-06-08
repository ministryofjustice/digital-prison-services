/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const setCookie = require('set-cookie-parser')

const sessionManagementRoutes = require('../sessionManagementRoutes')
const auth = require('../auth')
const config = require('../config')

const hmppsCookieName = 'testCookie'

const hasCookies = expectedNames => res => {
  const cookieNames = setCookie.parse(res).map(cookie => cookie.name)
  expect(cookieNames).toEqual(expect.arrayContaining(expectedNames))
}

const newNomisEndpointUrl = 'https://newnomis.url/'
config.app.notmEndpointUrl = newNomisEndpointUrl

describe('Test the routes and middleware installed by sessionManagementRoutes', () => {
  const app = express()

  app.set('view engine', 'ejs')
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
    agent
      .get('/')
      .expect(302)
      .expect('location', '/login?returnTo=%2F'))

  it('GET "/some-page" with no cookie (not authenticated) redirects to /login?returnTo=some-page', () =>
    agent
      .get('/some-page')
      .expect(302)
      .expect('location', '/login?returnTo=%2Fsome-page'))

  it('GET "/login" when not authenticated returns login page', () => agent.get('/login').expect(302))

  it('GET "/heart-beat"', () =>
    agent
      .get('/heart-beat')
      .set('Accept', 'application/json')
      .expect(401))

  it('GET "/logout" clears the cookie', () =>
    agent
      .get('/auth/logout')
      .expect(302)
      .expect(
        'location',
        'http://localhost:9090/auth/logout?client_id=elite2apiclient&redirect_uri=https://newnomis.url/'
      ))

  it('After logout get "/" should redirect to "/login"', () =>
    agent
      .get('/')
      .expect(302)
      .expect('location', '/login?returnTo=%2F')
      .expect(hasCookies([])))
})
