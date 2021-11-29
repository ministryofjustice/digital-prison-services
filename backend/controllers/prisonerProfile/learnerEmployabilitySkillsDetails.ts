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

export default ({ prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const [prisonerDetails, learnerEmployabilitySkills]: [PrisonerDetails, any] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getLearnerEmployabilitySkills(offenderNo),
      ])

      const { firstName, lastName } = prisonerDetails

      return res.render('prisonerProfile/prisonerWorkAndSkills/learnerEmployabilitySkills.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#courses-summary`,
        learnerEmployabilitySkills,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
