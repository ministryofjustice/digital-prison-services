/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const setCookie = require('set-cookie-parser')
const chai = require('chai')

const { expect } = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const sessionManagementRoutes = require('../sessionManagementRoutes')
const contextProperties = require('../contextProperties')
const { AuthClientError } = require('../api/oauthApi')

const hmppsCookieName = 'testCookie'

const accessToken = 'AT'
const refreshToken = 'RT'

const hasCookies = expectedNames => res => {
  const cookieNames = setCookie.parse(res).map(cookie => cookie.name)
  expect(cookieNames).to.have.members(expectedNames)
}

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

  const setTokensOnContext = context =>
    new Promise(resolve => {
      contextProperties.setTokens({ access_token: accessToken, refresh_token: refreshToken }, context)
      resolve()
    })

  const rejectWithStatus = rejectStatus => () => Promise.reject({ response: { status: rejectStatus } })

  const rejectWithAuthenticationError = errorText => () => Promise.reject(AuthClientError(errorText))

  const oauthApi = {
    authenticate: setTokensOnContext,
    refresh: () => Promise.resolve(),
  }

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
    oauthApi,
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

  const callback = done =>
    function checkDone(err) {
      if (err) {
        if (done.fail) {
          // jest
          done.fail(err)
        } else {
          // mocha
          done(err)
        }
      } else {
        done()
      }
    }

  it('GET "/" with no cookie (not authenticated) redirects to /auth/login', done => {
    tokenRefresher.resolves()

    agent
      .get('/')
      .expect(302)
      .expect('location', '/auth/login')
      .end(callback(done))
  })

  it('GET "/auth/login" when not authenticated returns login page', done => {
    agent
      .get('/auth/login')
      .expect(200)
      .expect('content-type', /text\/html/)
      .expect(/Login/)
      .end(callback(done))
  })

  it('successful login redirects to "/" setting hmpps cookie', done => {
    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(302)
      .expect('location', '/')
      .expect(hasCookies(['testCookie']))
      .end(callback(done))
  })

  it('GET "/auth/login" when authenticated redirects to "/"', done => {
    agent
      .get('/auth/login')
      .expect(302)
      .expect('location', '/')
      .end(callback(done))
  })

  it('GET "/" with cookie serves content', done => {
    agent
      .get('/')
      .expect(200)
      .expect('static')
      .end(callback(done))
  })

  it('GET "/heart-beat"', done => {
    agent
      .get('/heart-beat')
      .expect(200)
      .expect(() => {
        expect(tokenRefresher).to.be.called
      })
      .end(callback(done))
  })

  it('GET "/heart-beat" when refresh fails', done => {
    tokenRefresher.rejects()

    agent
      .get('/heart-beat')
      .expect(500)
      .expect(() => {
        expect(tokenRefresher).to.be.called
      })
      .end(callback(done))
  })

  it('GET "/auth/logout" clears the cookie', done => {
    const newNomisEndpointUrl = 'https://newnomis.url'
    process.env.NN_ENDPOINT_URL = newNomisEndpointUrl
    tokenRefresher.resolves()

    agent
      .get('/auth/logout')
      .expect(302)
      .expect('location', `${newNomisEndpointUrl}/auth/login`)
      // The server sends a set cookie header to clear the cookie.
      // The next test shows that the cookie was cleared because of the redirect to '/'
      .expect(hasCookies(['testCookie']))
      .end(callback(done))
  })

  it('After logout get "/" should redirect to "/auth/login"', done => {
    agent
      .get('/')
      .expect(302)
      .expect('location', '/auth/login')
      .expect(hasCookies([]))
      .end(callback(done))
  })

  it('Unsuccessful signin - auth client error', () => {
    oauthApi.authenticate = rejectWithAuthenticationError('Your password has expired.')

    return agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(401)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login')
        expect(res.text).to.include('Your password has expired.')
      })
  })
  it('Unsuccessful signin - server error', () => {
    oauthApi.authenticate = rejectWithStatus(503)

    return agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(503)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login')
        expect(res.text).to.include('Service unavailable. Please try again later.')
      })
  })
})
