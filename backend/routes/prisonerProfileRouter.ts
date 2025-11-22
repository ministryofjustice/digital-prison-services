import express from 'express'
import EsweService from '../services/esweService'
import paginationService from '../services/paginationService'
import workInsidePrison from '../controllers/prisonerProfile/prisonerWorkInsidePrisonDetails'
import prisonerProfileRedirect from '../controllers/prisonerProfile/prisonerProfileRedirect'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, systemOauthClient, whereaboutsApi, curiousApi }) => {
  const esweService = EsweService.create(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)

  router.get('/', prisonerProfileRedirect({ path: '/' }))

  router.get('/image', prisonerProfileRedirect({ path: '/image' }))

  router.get('/personal', prisonerProfileRedirect({ path: '/personal' }))
  router.get('/alerts', prisonerProfileRedirect({ path: '/alerts' }))
  router.get('/case-notes', prisonerProfileRedirect({ path: '/case-notes' }))
  router.get('/sentence-and-release', prisonerProfileRedirect({ path: '/offences' }))
  router.get('/work-and-skills', prisonerProfileRedirect({ path: '/work-and-skills' }))
  router.get('/cell-history', prisonerProfileRedirect({ path: '/location-details' }))

  // NB: route not migrated https://github.com/ministryofjustice/hmpps-prisoner-profile/blob/2cab81565a749f2b9af2696a5b939c878b1379bc/server/routes/index.ts#L136
  router.get('/work-activities', workInsidePrison({ paginationService, prisonApi, esweService }))

  return router
}

export default (dependencies) => controller(dependencies)
