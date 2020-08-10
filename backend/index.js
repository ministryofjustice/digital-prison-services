require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const express = require('express')

const app = express()

const path = require('path')
const apis = require('./apis')
const config = require('./config')
const routes = require('./routes')

const setupWebSession = require('./setupWebSession')
const setupHealthChecks = require('./setupHealthChecks')
const setupBodyParsers = require('./setupBodyParsers')
const setupWebSecurity = require('./setupWebSecurity')
const setupAuth = require('./setupAuth')
const setupSass = require('./setupSass')
const setupStaticContent = require('./setupStaticContent')
const nunjucksSetup = require('./utils/nunjucksSetup')
const setupWebpackForDev = require('./setupWebpackForDev')
const setupRedirects = require('./setupRedirects')

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'ejs')
app.set('view engine', 'njk')

nunjucksSetup(app, path)

app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupSass())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi: apis.oauthApi, tokenVerificationApi: apis.tokenVerificationApi }))
app.use(setupWebpackForDev())
app.use(routes({ ...apis }))

app.use((req, res) => {
  res.redirect(config.app.notmEndpointUrl)
})

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
