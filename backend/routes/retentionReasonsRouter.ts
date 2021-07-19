// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'retentionR... Remove this comment to see the full error message
const { retentionReasonsFactory } = require('../controllers/retentionReasons')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, dataComplianceApi, logError }) => {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
  const { index, post } = retentionReasonsFactory(prisonApi, dataComplianceApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
