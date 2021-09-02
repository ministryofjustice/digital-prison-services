import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { app } from '../../config'

import { formatName, putLastNameFirst } from '../../utils'

export default ({ prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    if (!app.esweEnabled) {
      return res.redirect(`/prisoner/${offenderNo}`)
    }

    const [prisonerDetails, coursesAndQualifications] = await Promise.all(
      [prisonApi.getDetails(res.locals, offenderNo), esweService.getLearnerEducationFullDetails(offenderNo)].map(
        (apiCall) => logErrorAndContinue(apiCall)
      )
    )

    // @ts-expect-error FIX ME
    const { firstName, lastName } = prisonerDetails

    return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerCoursesQualificationsDetails.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      prisonerName: formatName(firstName, lastName),
      profileUrl: `/prisoner/${offenderNo}/work-and-skills#courses-summary`,
      coursesAndQualifications,
    })
  }
