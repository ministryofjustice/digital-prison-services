import { capitalize, formatName, putLastNameFirst, sortByDateTime } from '../../utils'
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

export default ({ paginationService, prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const { pageOffsetOption, skill } = req.query
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0

    try {
      // Guard against malicious url
      if (!skill?.match(/^[a-z ]+$/i)) {
        throw new Error('invalid skill query parameter')
      }

      const [prisonerDetails, learnerEmployabilitySkills]: [PrisonerDetails, any] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getLearnerEmployabilitySkillsDetails(offenderNo),
      ])

      const { firstName, lastName } = prisonerDetails

      const createEmployabilitySkillsDetailsRow = (sk) => {
        const review = learnerEmployabilitySkills.content?.get(sk)
        return {
          href: `/prisoner/${offenderNo}/skills?skill=${sk}`,
          text: `${capitalize(sk)} (${review?.length || '0'})`,
          active: skill === sk,
        }
      }

      const currentReview = learnerEmployabilitySkills.content?.get(skill)
      currentReview?.sort((a, b) => sortByDateTime(b.reviewDate, a.reviewDate)) // sort descending

      return res.render('prisonerProfile/prisonerWorkAndSkills/learnerEmployabilitySkills.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#employability-skills-summary`,
        prisonerDetails,
        learnerEmployabilitySkills,
        currentReviewPage: currentReview?.slice(pageOffset, pageOffset + PAGE_SIZE),
        createEmployabilitySkillsDetailsRow,
        skill,
        pagination: paginationService.getPagination(currentReview?.length, pageOffset, PAGE_SIZE, fullUrl),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
