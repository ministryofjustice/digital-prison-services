// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = () => {
  const rootDirectory = process.cwd()
  router.use('/app/bundle.js', express.static(path.join(__dirname, '../build/app/bundle.js')))
  router.use('/static', express.static(path.join(__dirname, '../build/static')))
  router.use('/images', express.static(path.join(__dirname, '../build/images')))

  const assetPaths = [
    'node_modules/govuk-frontend/govuk/assets',
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
  ]
  assetPaths.forEach((dir) => {
    router.use('/assets', express.static(path.join(rootDirectory, dir)))
  })

  return router
}
