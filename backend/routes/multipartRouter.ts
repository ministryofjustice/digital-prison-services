import express from 'express'
import setUpMultipartFormDataParsing from '../middleware/setUpMultipartFormDataParsing'

export default function multipartRouter(mountPath: string): express.Router {
  const router = express.Router()
  router.post(mountPath, setUpMultipartFormDataParsing())

  return router
}
