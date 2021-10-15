import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { app } from '../../config'

export default ({ prisonerProfileService, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const [prisonerProfileData, functionalSkillLevels, targets, coursesAndQualifications, currentWork] =
      await Promise.all(
        [
          prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
          esweService.getLearnerLatestAssessments(offenderNo),
          esweService.getLearnerGoals(offenderNo),
          esweService.getLearnerEducation(offenderNo),
          esweService.getCurrentActivities(offenderNo),
        ].map((apiCall) => logErrorAndContinue(apiCall))
      )

    return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerWorkAndSkills.njk', {
      prisonerProfileData,
      functionalSkillLevels,
      targets,
      coursesAndQualifications,
      currentWork,
      profileUrl: `/prisoner/${offenderNo}`,
    })
  }
