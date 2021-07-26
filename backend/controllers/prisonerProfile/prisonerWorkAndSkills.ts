import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { app } from '../../config'

export default ({ prisonerProfileService, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    if (!app.esweEnabled) {
      return res.redirect(`/prisoner/${offenderNo}`)
    }

    const [prisonerProfileData, functionalSkillLevels] = await Promise.all(
      [
        prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
        esweService.getLearnerLatestAssessments(offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerWorkAndSkills.njk', {
      prisonerProfileData,
      functionalSkillLevels,
    })
  }
