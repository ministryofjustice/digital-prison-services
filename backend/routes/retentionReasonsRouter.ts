import express from 'express'
import { retentionReasonsFactory } from '../controllers/retentionReasons'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, dataComplianceApi, logError }) => {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
  const { index, post } = retentionReasonsFactory(prisonApi, dataComplianceApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
