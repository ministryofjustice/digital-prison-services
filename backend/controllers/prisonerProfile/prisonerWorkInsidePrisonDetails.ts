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

type workHistoryInPrison = {
  enabled: boolean
  content: eswe.workHistoryFullDetails[]
}

export default ({ prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    if (!app.esweEnabled) {
      return res.redirect(`/prisoner/${offenderNo}`)
    }

    try {
      const [prisonerDetails, workHistoryInsidePrison]: [PrisonerDetails, workHistoryInPrison] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getWorkHistoryDetails(offenderNo),
      ])

      const { firstName, lastName } = prisonerDetails

      return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerWorkInsidePrisonDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#work-summary`,
        workHistoryInsidePrison,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
