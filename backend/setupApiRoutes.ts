import express from 'express'
import fs from 'fs'
import { isBinaryFileSync } from 'isbinaryfile'
import { logError } from './logError'
import config from './config'

import { userCaseloadsFactory as userCaseLoadsFactory } from './controllers/usercaseloads'
import { offenderActivitiesFactory } from './controllers/attendance/offenderActivities'
import { userLocationsFactory } from './controllers/userLocations'
import { userMeFactory } from './controllers/userMe'
import { getConfiguration } from './controllers/getConfig'
import { getHouseblockLocationsFactory as houseblockLocationsFactory } from './controllers/attendance/houseblockLocations'
import { getActivityLocationsFactory as activityLocationsFactory } from './controllers/attendance/activityLocations'
import { getActivityListFactory as activityListFactory } from './controllers/attendance/activityList'
import { getHouseblockListFactory as houseblockListFactory } from './controllers/attendance/houseblockList'
import { attendanceFactory } from './controllers/attendance/attendance'
import { imageFactory } from './controllers/images'
import { offenderLoaderFactory } from './controllers/offender-loader'
import getExistingEventsController from './controllers/attendance/getExistingEvents'
import getLocationExistingEventsController from './controllers/attendance/getLocationExistingEvents'
import endDateController from './controllers/appointments/endDate'
import existingEventsService from './services/existingEventsService'

import { factory as controllerFactory } from './controllers/controller'

import contextProperties from './contextProperties'
import { csvParserService } from './csv-parser'
import handleErrors from './middleware/asyncHandler'

const router = express.Router()

export const setup = ({
  prisonApi,
  whereaboutsApi,
  locationsInsidePrisonApi,
  oauthApi,
  getClientCredentialsTokens,
  hmppsManageUsersApi,
  caseNotesApi,
  prisonerAlertsApi,
}) => {
  const controller = controllerFactory({
    activityListService: activityListFactory(getClientCredentialsTokens, prisonApi, whereaboutsApi, prisonerAlertsApi),
    houseblockListService: houseblockListFactory(
      getClientCredentialsTokens,
      prisonApi,
      whereaboutsApi,
      locationsInsidePrisonApi,
      prisonerAlertsApi
    ),
    attendanceService: attendanceFactory(whereaboutsApi),
    offenderLoader: offenderLoaderFactory(prisonApi),
    csvParserService: csvParserService({ fs, isBinaryFileSync }),
    offenderActivitiesService: offenderActivitiesFactory(getClientCredentialsTokens, prisonApi, whereaboutsApi),
    caseNotesApi,
    prisonApi,
    logError,
  })

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      authUrl: config.apis.oauth2.url,
      currentUrlPath: req.originalUrl,
      hostname: req.hostname,
    }
    next()
  })

  // Extract pagination header information from requests and set on the 'context'
  router.use('/api', (req, res, next) => {
    contextProperties.setRequestPagination(res.locals, req.headers)
    next()
  })

  router.use('/api/config', getConfiguration)
  router.use('/api/userroles', userMeFactory(oauthApi, hmppsManageUsersApi).userRoles)
  router.use('/api/me', userMeFactory(oauthApi, hmppsManageUsersApi).userMe)
  router.use('/api/usercaseloads', userCaseLoadsFactory(prisonApi).userCaseloads)
  router.use('/api/userLocations', userLocationsFactory(prisonApi).userLocations)
  router.use(
    '/api/houseblockLocations',
    houseblockLocationsFactory(getClientCredentialsTokens, locationsInsidePrisonApi, logError).getHouseblockLocations
  )
  router.use('/api/activityLocations', activityLocationsFactory({ prisonApi, logError }).getActivityLocations)
  router.use('/api/houseblocklist', controller.getHouseblockList)
  router.use('/api/activityList', controller.getActivityList)
  router.use('/api/attendance/absence-reasons', controller.getAbsenceReasons)
  router.use('/api/attendance/batch', controller.batchUpdateAttendance)
  router.use('/api/attendance', controller.updateAttendance)
  router.use('/api/appointments/upload-offenders/:agencyId', controller.uploadOffenders)
  router.get('/app/images/:offenderNo/data', imageFactory(prisonApi).prisonerImage)
  router.get('/app/image/:imageId/data', imageFactory(prisonApi).image)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/prisoners-unaccounted-for', controller.getPrisonersUnaccountedFor)
  router.get('/api/get-case-note/:offenderNumber/:caseNoteId', handleErrors(controller.getCaseNote))
  router.get(
    '/api/get-offender-events',
    getExistingEventsController({
      prisonApi,
      existingEventsService: existingEventsService(getClientCredentialsTokens, prisonApi),
      logError,
    })
  )
  router.get(
    '/api/get-location-events',
    getLocationExistingEventsController({
      prisonApi,
      logError,
      existingEventsService: existingEventsService(getClientCredentialsTokens, prisonApi),
    })
  )
  router.get('/api/get-recurring-end-date', endDateController)

  return router
}

export default (dependencies) => setup(dependencies)
