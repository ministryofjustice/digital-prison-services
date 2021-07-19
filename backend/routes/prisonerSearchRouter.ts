// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonerSe... Remove this comment to see the full error message
const prisonerSearchController = require('../controllers/search/prisonerSearch')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'pagination... Remove this comment to see the full error message
const paginationService = require('../services/paginationService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'telemetry'... Remove this comment to see the full error message
const telemetry = require('../azure-appinsights')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, logError }) => {
  const { index, post } = prisonerSearchController({ paginationService, prisonApi, telemetry, logError })
  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
