/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const passport = require('passport')
const flash = require('connect-flash')
const setCookie = require('set-cookie-parser')
const chai = require('chai')

const { expect } = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const sessionManagementRoutes = require('../sessionManagementRoutes')
const auth = require('../auth')
const { AuthClientError } = require('../api/oauthApi')
const config = require('../config')

const hmppsCookieName = 'testCookie'

const hasCookies = expectedNames => res => {
  const cookieNames = setCookie.parse(res).map(cookie => cookie.name)
  expect(cookieNames).to.have.members(expectedNames)
}

const newNomisEndpointUrl = 'https://newnomis.url/'
config.app.notmEndpointUrl = newNomisEndpointUrl

describe('Test the routes and middleware installed by sessionManagementRoutes', () => {
  const app = express()

  app.set('view engine', 'ejs')
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use(
    cookieSession({
      name: hmppsCookieName,
      maxAge: 1 * 60 * 1000,
      secure: false,
      signed: false, // supertest can't cope with multiple cookies - https://github.com/visionmedia/supertest/issues/336
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  const rejectWithStatus = rejectStatus => () => Promise.reject({ response: { status: rejectStatus } })

  const rejectWithAuthenticationError = errorText => () => Promise.reject(AuthClientError(errorText))

  const oauthApi = {
    authenticate: () => Promise.resolve({ access_token: 'token' }),
    refresh: () => Promise.resolve({ access_token: 'newToken' }),
  }
  auth.init(oauthApi)

  const healthApi = {
    isUp: () => Promise.resolve(true),
  }

  /**
   * A Token refresher that does nothing.
   * @returns {Promise<void>}
   */
  const tokenRefresher = sinon.stub()

  sessionManagementRoutes.configureRoutes({
    app,
    healthApi,
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

  it('GET "/" with no cooke (not authenticated) redirects to /login', () => {
    tokenRefresher.resolves()

    return agent
      .get('/')
      .expect(302)
      .expect('location', '/login?returnTo=%2F')
  })

  it('GET "/some-page" with no cooke (not authenticated) redirects to /login?returnTo=some-page', () => {
    tokenRefresher.resolves()

    return agent
      .get('/some-page')
      .expect(302)
      .expect('location', '/login?returnTo=%2Fsome-page')
  })

  it('GET "/login" when not authenticated returns login page', () =>
    agent
      .get('/login')
      .expect(200)
      .expect('content-type', /text\/html/)
      .expect(/Sign in/))

  it('successful login redirects to "/" setting hmpps cookie', () =>
    agent
      .post('/login')
      .send('username=test&password=testPassowrd')
      .expect(302)
      .expect('location', '/')
      .expect(hasCookies(['testCookie'])))

  it('GET "/login" when authenticated redirects to "/"', () =>
    agent
      .get('/login')
      .expect(302)
      .expect('location', '/'))

  it('GET "/" with cookie serves content', () =>
    agent
      .get('/')
      .expect(200)
      .expect('static'))

  it('GET "/heart-beat"', () =>
    agent
      .get('/heart-beat')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(() => {
        expect(tokenRefresher).to.be.called
      }))

  it('GET "/heart-beat" when refresh fails', () => {
    tokenRefresher.rejects()

    return agent
      .get('/heart-beat')
      .set('Accept', 'application/json')
      .expect(401)
      .expect(() => {
        expect(tokenRefresher).to.be.called
      })
  })

  it('GET "/logout" clears the cookie', () => {
    tokenRefresher.resolves()

    return (
      agent
        .get('/auth/logout')
        .expect(302)
        .expect('location', `${newNomisEndpointUrl}login`)
        // The server sends a set cookie header to clear the cookie.
        // The next test shows that the cookie was cleared because of the redirect to '/'
        .expect(hasCookies(['testCookie']))
    )
  })

  it('After logout get "/" should redirect to "/login"', () =>
    agent
      .get('/')
      .expect(302)
      .expect('location', '/login?returnTo=%2F')
      .expect(hasCookies([])))

  it('Unsuccessful signin - auth client error', () => {
    oauthApi.authenticate = rejectWithAuthenticationError('Your password has expired.')

    return agent
      .post('/login')
      .send('username=test&password=testPassowrd')
      .redirects(1)
      .expect(/Sign in/)
      .expect(res => {
        expect(res.text).to.include('Your password has expired.')
      })
  })

  it('Unsuccessful signin - server error', () => {
    oauthApi.authenticate = rejectWithStatus(503)

    return agent
      .post('/login')
      .send('username=test&password=testPassowrd')
      .redirects(1)
      .expect(/Sign in/)
      .expect(res => {
        expect(res.text).to.include('A system error occurred; please try again later')
      })
  })
})
