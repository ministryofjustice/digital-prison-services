// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const { bulkAppointmentsConfirmFactory } = require('../../controllers/appointments/bulkAppointmentsConfirm')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsConfirmFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
