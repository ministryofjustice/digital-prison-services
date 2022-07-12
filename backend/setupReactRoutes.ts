import express from 'express'
import path from 'path'

const router = express.Router()

const setup = (_dependencies) => {
  // These are routes defined in the react router
  // They are listed here so the express app also knows about
  // them and knows to pass them onto the react router
  // This is needed in order to implement a page not found behaviour.
  router.get('/manage-prisoner-whereabouts*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
  })

  router.get('/iep-slip', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
  })

  return router
}

export default (dependencies?: unknown): any => setup(dependencies)
