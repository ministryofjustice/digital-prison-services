// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logErrorAn... Remove this comment to see the full error message
const logErrorAndContinue = require('../../shared/logErrorAndContinue')

module.exports =
  ({ prisonerProfileService, esweService }) =>
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
