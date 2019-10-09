const express = require('express')
const path = require('path')

const nunjucksSetup = require('./utils/nunjucksSetup')

const router = express.Router()

module.exports = ({ app }) => {
  nunjucksSetup(app, path)

  router.use(express.static(path.join(__dirname, '../build'))) // << this needed?
  router.use(express.static(path.join(__dirname, '../build/static')))

  const assetPaths = ['../node_modules/govuk-frontend/govuk/assets', '../node_modules/govuk-frontend']
  assetPaths.forEach(dir => {
    router.use('/assets', express.static(path.join(__dirname, dir)))
  })

  return router
}
