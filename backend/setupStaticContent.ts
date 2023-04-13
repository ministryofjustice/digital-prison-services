import express from 'express'
import compression from 'compression'
import noCache from 'nocache'
import path from 'path'

const router = express.Router()

export default () => {
  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: '1d' }

  const rootDirectory = process.cwd()
  router.use('/app/bundle.js', express.static(path.join(__dirname, '../build/app/bundle.js'), cacheControl))
  router.use('/static', express.static(path.join(__dirname, '../build/static'), cacheControl))
  router.use('/images', express.static(path.join(__dirname, '../build/images'), cacheControl))

  const assetPaths = [
    'node_modules/govuk-frontend/govuk/assets',
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
  ]
  assetPaths.forEach((dir) => {
    router.use('/assets', express.static(path.join(rootDirectory, dir), cacheControl))
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
