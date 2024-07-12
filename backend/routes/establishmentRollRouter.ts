import express from 'express'
import config from '../config'

const router = express.Router({ mergeParams: true })

const controller = () => {
  router.use((req, res, next) => {
    return res.render('establishmentRoll/hasMoved.njk', {
      redirectUrl: `${config.app.homepageRedirect.url}/establishment-roll`,
      changesUrl: `${config.app.homepageRedirect.url}/whats-new/establishment-roll-update`,
    })
  })

  return router
}

export default controller
