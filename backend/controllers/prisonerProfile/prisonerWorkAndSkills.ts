import logErrorAndContinue from '../../shared/logErrorAndContinue'

export default ({ prisonerProfileService, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

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
