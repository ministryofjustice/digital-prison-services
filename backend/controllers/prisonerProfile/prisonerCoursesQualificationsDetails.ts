import { app } from '../../config'
import { formatName, putLastNameFirst } from '../../utils'
import { PAGE_SIZE } from '../../services/esweService'

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

type CoursesAndQuals = {
  enabled: boolean
  content: eswe.LearnerEducationFullDetails
}

export default ({ paginationService, prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const { pageOffsetOption } = req.query
    const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0
    const page = pageOffset / PAGE_SIZE

    try {
      const [prisonerDetails, coursesAndQualifications]: [PrisonerDetails, CoursesAndQuals] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getLearnerEducationFullDetails(offenderNo, page),
      ])

      const { firstName, lastName } = prisonerDetails
      const { pagination } = coursesAndQualifications.content

      return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerCoursesQualificationsDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#courses-summary`,
        coursesAndQualifications,
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
