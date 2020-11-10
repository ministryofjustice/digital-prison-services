require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const express = require('express')
const csrf = require('csurf')

const app = express()

const apis = require('./apis')
const config = require('./config')
const routes = require('./routes')
const { notifyClient } = require('./shared/notifyClient')
const { logError } = require('./logError')

const setupWebSession = require('./setupWebSession')
const setupHealthChecks = require('./setupHealthChecks')
const setupBodyParsers = require('./setupBodyParsers')
const setupWebSecurity = require('./setupWebSecurity')
const setupAuth = require('./setupAuth')
const setupStaticContent = require('./setupStaticContent')
const nunjucksSetup = require('./utils/nunjucksSetup')
const setupWebpackForDev = require('./setupWebpackForDev')
const setupRedirects = require('./setupRedirects')
const setupApiRoutes = require('./setupApiRoutes')
const setupReactRoutes = require('./setupReactRoutes')
const phaseNameSetup = require('./phaseNameSetup')
const setupBvlRoutes = require('./setupBvlRoutes')

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'njk')

nunjucksSetup(app)
phaseNameSetup(app, config)

app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi: apis.oauthApi, tokenVerificationApi: apis.tokenVerificationApi }))
app.use(setupWebpackForDev())
app.use(
  setupApiRoutes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    caseNotesApi: apis.caseNotesApi,
  })
)
app.use(csrf())
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

app.use(
  setupBvlRoutes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    notifyClient,
    logError,
  })
)

app.use(setupReactRoutes())

app.use((req, res) => {
  res.redirect(config.app.notmEndpointUrl)
})

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
