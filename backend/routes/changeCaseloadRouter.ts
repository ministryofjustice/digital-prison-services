import express from 'express'
import { changeCaseloadFactory } from '../controllers/changeCaseload'

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = changeCaseloadFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)
  return router
}

export default (dependencies) => controller(dependencies)
