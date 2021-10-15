import { app } from '../../config'
import { formatName, putLastNameFirst } from '../../utils'

type PrisonerDetails = {
  offenderNo: string
  firstName: string
  lastName: string
  bookingId: number
  bookingNo: string
  rootOffenderId: number
  dateOfBirth: string
  activeFlag: boolean
  agencyId: string
  assignedLivingUnitId: number
}

type activitiesInPrison = {
  enabled: boolean
  content: eswe.activitiesHistory
}

export default ({ paginationService, prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const { pageOffsetOption } = req.query
    const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0
    const page = pageOffset / 20

    try {
      const [prisonerDetails, activitiesHistory]: [PrisonerDetails, activitiesInPrison] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getActivitiesHistoryDetails(offenderNo, page),
      ])

      const { firstName, lastName } = prisonerDetails
      const { fullDetails, pagination } = activitiesHistory.content

      return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerWorkInsidePrisonDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#work-summary`,
        activitiesHistory: fullDetails,
        pagination: paginationService.getPagination(
          pagination.totalRecords,
          pageOffset || pagination.offset,
          pagination.limit,
          fullUrl
        ),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
