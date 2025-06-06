import asyncMiddleware from '../middleware/asyncHandler'
import { serviceUnavailableMessage } from '../common-messages'
import { getContextWithClientTokenAndRoles } from './prisonerProfile/prisonerProfileContext'
import contextProperties from '../contextProperties'

export const factory = ({
  activityListService,
  houseblockListService,
  attendanceService,
  offenderLoader,
  csvParserService,
  offenderActivitiesService,
  caseNotesApi,
  prisonApi,
  logError,
}) => {
  const getActivityList = async (req, res) => {
    const { agencyId, locationId, date, timeSlot } = req.query
    try {
      const viewModel = await activityListService.getActivityList(res.locals, agencyId, locationId, date, timeSlot)
      return res.json(viewModel)
    } catch (error) {
      if (error.code === 'ECONNRESET' || (error.stack && error.stack.toLowerCase().includes('timeout'))) {
        logError(req.originalUrl, error, 'getActivityList() - timeout')
        res.json({
          error: {
            response: {
              data: `${serviceUnavailableMessage}. You can try again.`,
            },
          },
        })
        res.status(200)
        return res.end()
      }
      logError(req.originalUrl, error, 'getActivityList()')
      const errorStatusCode = (error && error.status) || (error.response && error.response.status) || 500
      res.status(errorStatusCode)
      return res.end()
    }
  }

  const getHouseblockList = async (req, res) => {
    const { agencyId, groupName, date, timeSlot, wingStatus } = req.query
    try {
      const viewModel = await houseblockListService.getHouseblockList(
        res.locals,
        agencyId,
        groupName,
        date,
        timeSlot,
        wingStatus
      )
      return res.json(viewModel)
    } catch (error) {
      if (error.code === 'ECONNRESET' || (error.stack && error.stack.toLowerCase().includes('timeout')))
        return res.end()
      logError(req.originalUrl, error, 'getHouseblockList()')
      const errorStatusCode = (error && error.status) || (error.response && error.response.status) || 500
      res.status(errorStatusCode)
      return res.end()
    }
  }

  const updateAttendance = asyncMiddleware(async (req, res) => {
    const attendanceRecord = await attendanceService.updateAttendance(res.locals, req.body)
    res.json(attendanceRecord)
  })

  const batchUpdateAttendance = asyncMiddleware(async (req, res) => {
    const batchAttendanceRecord = await attendanceService.batchUpdateAttendance(res.locals, req.body)
    res.json(batchAttendanceRecord)
  })

  const getAbsenceReasons = asyncMiddleware(async (req, res) => {
    const absenceReasons = await attendanceService.getAbsenceReasons(res.locals)
    res.json(absenceReasons)
  })

  const uploadOffenders = asyncMiddleware(async (req, res) => {
    const { file } = req.files
    const { agencyId } = req.params

    csvParserService
      .loadAndParseCsvFile(file)
      .then(async (fileContent) => {
        const viewModel = await offenderLoader.loadFromCsvContent(res.locals, fileContent, agencyId)
        res.json(viewModel)
      })
      .catch((error) => {
        res.status(400)
        res.send(error.message)
        res.end()
      })
  })

  const bulkAppointmentsCsvTemplate = asyncMiddleware(async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=offenders-for-appointments.csv')
    res.set('Content-Type', 'text/csv')
    res.status(200).send(`Prison number\n,\n`)
    res.end()
  })

  const getPrisonersUnaccountedFor = asyncMiddleware(async (req, res) => {
    const { agencyId, date, timeSlot } = req.query
    const viewModel = await offenderActivitiesService.getPrisonersUnaccountedFor(res.locals, agencyId, date, timeSlot)
    res.json(viewModel)
  })

  const getCaseNote = asyncMiddleware(async (req, res) => {
    const { offenderNumber, caseNoteId } = req.params
    const { context } = await getContextWithClientTokenAndRoles({
      offenderNo: offenderNumber,
      res,
      req,
      oauthApi: null,
      systemOauthClient: null,
      restrictedPatientApi: null,
    })

    const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNumber)
    if (prisonerDetails?.agencyId) {
      contextProperties.setCustomRequestHeaders(context, { CaseloadId: prisonerDetails.agencyId })
    }

    const caseNote = await caseNotesApi.getCaseNote(context, offenderNumber, caseNoteId)

    const translateToFirstLast = (lastNameFirstName) => {
      if (!lastNameFirstName) return ''
      if (!lastNameFirstName.includes(',')) return lastNameFirstName
      const reversed = lastNameFirstName.split(',').reverse()
      return `${reversed[0].trim()}, ${reversed[1].trim()}`
    }

    res.json({
      ...caseNote,
      authorName: translateToFirstLast(caseNote.authorName),
    })
  })

  return {
    getActivityList,
    getHouseblockList,
    updateAttendance,
    batchUpdateAttendance,
    getAbsenceReasons,
    uploadOffenders,
    bulkAppointmentsCsvTemplate,
    getPrisonersUnaccountedFor,
    getCaseNote,
  }
}

export default {
  factory,
}
