import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import passport from 'passport'
import flash from 'connect-flash'
import setCookie from 'set-cookie-parser'
import sessionManagementRoutes from '../sessionManagementRoutes'
import auth from '../auth'
import config from '../config'

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
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ app: Express; tokenRefresher: ... Remove this comment to see the full error message
    mailTo: 'test@site.com',
  })

  // some content to send for '/'
  app.get('/', (req, res) => {
    res.send('static')
  })

  // Create an agent.  The agent handles and sends cookies. (It has state). The order of test below is important
  // because the outcome of each test depends upon the successful completion of the previous tests.
  const agent = request.agent(app)

  it('GET "/" with no cookie (not authenticated) redirects to /sign-in', () =>
    agent.get('/').expect(302).expect('location', '/sign-in?returnTo=%2F'))

  it('GET "/some-page" with no cookie (not authenticated) redirects to /sign-in?returnTo=some-page', () =>
    agent.get('/some-page').expect(302).expect('location', '/sign-in?returnTo=%2Fsome-page'))

  it('GET "/sign-in" when not authenticated returns sign in page', () => agent.get('/sign-in').expect(302))

  it('GET "/heart-beat"', () => agent.get('/heart-beat').set('Accept', 'application/json').expect(401))

  it('GET "/sign-out" clears the cookie', () =>
    agent
      .get('/auth/sign-out')
      .expect(302)
      .expect(
        'location',
        'http://localhost:9090/auth/sign-out?client_id=prisonapiclient&redirect_uri=https://digital.prison.url/'
      ))

  it('After sign out get "/" should redirect to "/sign-in"', () =>
    agent.get('/').expect(302).expect('location', '/sign-in?returnTo=%2F').expect(hasCookies([])))
})
