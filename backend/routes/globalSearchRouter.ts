// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'globalSear... Remove this comment to see the full error message
const globalSearchController = require('../controllers/globalSearch')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'pagination... Remove this comment to see the full error message
const paginationService = require('../services/paginationService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'telemetry'... Remove this comment to see the full error message
const telemetry = require('../azure-appinsights')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ offenderSearchApi, oauthApi, logError }) => {
  const { indexPage, resultsPage } = globalSearchController({
    paginationService,
    offenderSearchApi,
    oauthApi,
    telemetry,
    logError,
  })

  router.get('/', indexPage)
  router.get('/results', resultsPage)

  return router
}

module.exports = (dependencies) => controller(dependencies)
