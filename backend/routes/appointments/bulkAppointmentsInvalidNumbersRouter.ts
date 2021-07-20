// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
  bulkAppointmentsInvalidNumbersFactory,
} = require('../../controllers/appointments/bulkAppointmentsInvalidNumbers')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = () => {
  const { index } = bulkAppointmentsInvalidNumbersFactory()

  router.get('/', index)

  return router
}

module.exports = (dependencies) => controller(dependencies)
