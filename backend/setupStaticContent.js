const express = require('express')
const path = require('path')

const router = express.Router()

module.exports = () => {
  router.use('/app/bundle.js', express.static(path.join(__dirname, '../build/app/bundle.js')))
  router.use('/static', express.static(path.join(__dirname, '../build/static')))
  router.use('/images', express.static(path.join(__dirname, '../build/images')))

  const assetPaths = [
    '../node_modules/govuk-frontend/govuk/assets',
    '../node_modules/govuk-frontend',
    '../node_modules/@ministryofjustice/frontend',
  ]
  assetPaths.forEach((dir) => {
    router.use('/assets', express.static(path.join(__dirname, dir)))
  })

  return router
}
