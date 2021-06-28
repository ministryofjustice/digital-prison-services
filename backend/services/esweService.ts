import { app } from '../config'
import { readableDateFormat } from '../utils'
import type CuriousApi from '../api/curious/curiousApi'

type FeatureFlagged<T> = {
  enabled: boolean
  content: T
}

type LearnerProfiles = FeatureFlagged<curious.LearnerProfile[]>
type LearnerLatestAssessments = FeatureFlagged<curious.FunctionalSkillsLevels>

/**
 * Education skills and work experience (ESWE)
 */
export default class EsweService {
  static create(curiousApi: CuriousApi): EsweService {
    return new EsweService(curiousApi)
  }

  constructor(private readonly curiousApi: CuriousApi) {}

  async getLearnerProfiles(nomisId: string): Promise<LearnerProfiles> {
    if (!app.esweEnabled) {
      return {
        enabled: app.esweEnabled,
        content: [],
      }
    }

    return {
      enabled: app.esweEnabled,
      content: await this.curiousApi.getLearnerProfiles(nomisId),
    }
  }

  async getLearnerLatestAssessments(nomisId: string): Promise<LearnerLatestAssessments> {
    if (!app.esweEnabled) {
      return {
        enabled: app.esweEnabled,
        content: {},
      }
    }

    const content = await this.curiousApi.getLearnerLatestAssessments(nomisId)

    const filterSkillsAndGetLatestGrade = (functionalSkillLevels, skillToFilter) =>
      functionalSkillLevels[0].qualifications
        .filter((functionalSkillLevel) => functionalSkillLevel.qualification.qualificationType === skillToFilter)
        .sort(
          (a, b) =>
            new Date(b.qualification.assessmentDate).getTime() - new Date(a.qualification.assessmentDate).getTime()
        )[0]

    const englishSkillLevels = filterSkillsAndGetLatestGrade(content, 'English') || { skill: 'English/Welsh' }
    const mathsSkillLevels = filterSkillsAndGetLatestGrade(content, 'Maths') || { skill: 'Maths' }
    const digiLitSkillLevels = filterSkillsAndGetLatestGrade(content, 'Digital Literacy') || {
      skill: 'Digital Literacy',
    }

    const createSkillAssessmentSummary = (skillAssessment) => {
      if (!skillAssessment.qualification) return [{ label: skillAssessment.skill, value: 'Awaiting assessment' }]

      const { qualificationType, qualificationGrade, assessmentDate } = skillAssessment.qualification
      const { establishmentName } = skillAssessment

      return [
        {
          label: qualificationType === 'English' ? 'English/Welsh' : qualificationType,
          value: qualificationGrade,
        },
        {
          label: 'Assessment Date',
          value: readableDateFormat(assessmentDate, 'YYYY-MM-DD'),
        },
        {
          label: 'Location',
          value: establishmentName,
        },
      ]
    }

    const functionalSkillLevels = {
      english: createSkillAssessmentSummary(englishSkillLevels),
      maths: createSkillAssessmentSummary(mathsSkillLevels),
      digiLit: createSkillAssessmentSummary(digiLitSkillLevels),
    }

    return {
      enabled: app.esweEnabled,
      content: functionalSkillLevels,
    }
  }
}
