require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const express = require('express')
require('express-async-errors')

const csrf = require('csurf')
const cookieParser = require('cookie-parser')

const app = express()

const apis = require('./apis')
const config = require('./config')
const routes = require('./routes')

const setupWebSession = require('./setupWebSession')
const setupHealthChecks = require('./setupHealthChecks')
const setupBodyParsers = require('./setupBodyParsers')
const setupWebSecurity = require('./setupWebSecurity')
const setupAuth = require('./setupAuth')
const setupStaticContent = require('./setupStaticContent')
const nunjucksSetup = require('./utils/nunjucksSetup')
const setupRedirects = require('./setupRedirects')
const setupApiRoutes = require('./setupApiRoutes')
const setupReactRoutes = require('./setupReactRoutes')
const phaseNameSetup = require('./phaseNameSetup')
const currentUser = require('./middleware/currentUser')

const pageNotFound = require('./setUpPageNotFound')
const errorHandler = require('./middleware/errorHandler')

const { logError } = require('./logError')
const homepageController = require('./controllers/homepage/homepage')

// eslint-disable-next-line  global-require
const setupWebpackForDev = !config.app.disableWebpack && require('./setupWebpackForDev')

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'njk')

nunjucksSetup(app)
phaseNameSetup(app, config)

app.use(cookieParser())
app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi: apis.oauthApi, tokenVerificationApi: apis.tokenVerificationApi }))

app.use(currentUser({ prisonApi: apis.prisonApi, oauthApi: apis.oauthApi }))

if (!config.app.disableWebpack) app.use(setupWebpackForDev())

app.use(
  setupApiRoutes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    caseNotesApi: apis.caseNotesApi,
  })
)
app.use(csrf())
app.use((req, res, next) => {
  if (typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken()
  }
  next()
})

app.use(
  routes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    communityApi: apis.communityApi,
    dataComplianceApi: apis.dataComplianceApi,
    keyworkerApi: apis.keyworkerApi,
    caseNotesApi: apis.caseNotesApi,
    allocationManagerApi: apis.allocationManagerApi,
    pathfinderApi: apis.pathfinderApi,
    socApi: apis.socApi,
    offenderSearchApi: apis.offenderSearchApi,
  })
)

app.use(setupReactRoutes())
app.use('/$', homepageController({ ...apis, logError }))
app.use(pageNotFound)
app.use(errorHandler)

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
