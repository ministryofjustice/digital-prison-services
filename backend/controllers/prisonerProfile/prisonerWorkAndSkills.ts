import e from 'express'
import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { capitalize } from '../../utils'

export default ({ prisonerProfileService, esweService }) =>
  async (req: e.Request, res: e.Response): Promise<void> => {
    const { offenderNo } = req.params

    const [
      prisonerProfileData,
      functionalSkillLevels,
      targets,
      coursesAndQualifications,
      currentWork,
      employabilitySkills,
    ] = await Promise.all<any>(
      [
        prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
        esweService.getLearnerLatestAssessments(offenderNo),
        esweService.getLearnerGoals(offenderNo),
        esweService.getLearnerEducation(offenderNo),
        esweService.getCurrentActivities(res.locals, offenderNo),
        esweService.getLearnerEmployabilitySkills(offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    const createEmployabilitySkillsRow = (skill) => ({
      key: {
        html: `<a href="/prisoner/offenderNo/skills?${encodeURI(
          skill
        )}" class="govuk-link govuk-!-font-weight-regular">${capitalize(skill)}</a>`,
      },
      value: {
        text: employabilitySkills.content?.get(skill)?.currentProgression || 'Not assessed',
      },
    })

    return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerWorkAndSkills.njk', {
      prisonerProfileData,
      functionalSkillLevels,
      targets,
      coursesAndQualifications,
      currentWork,
      employabilitySkills,
      createEmployabilitySkillsRow,
      profileUrl: `/prisoner/${offenderNo}`,
    })
  }
