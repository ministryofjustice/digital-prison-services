import express from 'express'
import deleteCaseNoteController from '../controllers/deleteCaseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, oauthApi, logError, systemOauthClient }) => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; caseNotesApi: ... Remove this comment to see the full error message
  const { index, post } = deleteCaseNoteController({ prisonApi, caseNotesApi, oauthApi, logError, systemOauthClient })

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
