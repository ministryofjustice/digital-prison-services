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

// These are routes defined in the react router
// They are listed here so the express app also knows about
// them and knows to pass them onto the react router
// This is needed in order to implement a page not found behaviour.
app.get('/establishment-roll*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.get('/manage-prisoner-whereabouts*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.get('/offenders/:offenderNo/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use('/content*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.get('/global-search*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use((req, res) => {
  res.redirect(config.app.notmEndpointUrl)
})

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
