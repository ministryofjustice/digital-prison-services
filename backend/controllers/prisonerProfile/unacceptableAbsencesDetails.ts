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

type attendanceDetails = {
  enabled: boolean
  content: eswe.attendanceDetails
}

export default ({ paginationService, prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const { pageOffsetOption } = req.query
    const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0
    const page = pageOffset / 20

    try {
      const [prisonerDetails, attendanceDetails, prisonArray]: [PrisonerDetails, attendanceDetails, any[]] =
        await Promise.all([
          prisonApi.getDetails(res.locals, offenderNo),
          esweService.getAttendanceDetails(offenderNo, page),
          prisonApi.getAgencies(res.locals),
        ])

      const { firstName, lastName } = prisonerDetails
      const { fullDetails, pagination } = attendanceDetails.content

      return res.render('prisonerProfile/prisonerWorkAndSkills/unacceptableAbsencesDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#work-summary`,
        fullDetails,
        pagination: paginationService.getPagination(
          pagination.totalRecords,
          pageOffset || pagination.offset,
          pagination.limit,
          fullUrl
        ),
        prisons: new Map(prisonArray.map((p) => [p.agencyId, p.formattedDescription])),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
