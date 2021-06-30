import moment from 'moment'
import { app } from '../config'
import { readableDateFormat } from '../utils'
import type CuriousApi from '../api/curious/curiousApi'
import { ClientContext } from '../api/oauthEnabledClient'
import log from '../log'

type FeatureFlagged<T> = {
  enabled: boolean
  content: T
}

type LearnerProfiles = FeatureFlagged<curious.LearnerProfile[]>
type LearnerLatestAssessments = FeatureFlagged<curious.FunctionalSkillsLevels>

const createFlaggedContent = <T>(content: T) => ({
  enabled: app.esweEnabled,
  content,
})

const CURIOUS_DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Education skills and work experience (ESWE)
 */
export default class EsweService {
  static create(curiousApi: CuriousApi, systemOauthClient: any): EsweService {
    return new EsweService(curiousApi, systemOauthClient)
  }

  constructor(private readonly curiousApi: CuriousApi, private readonly systemOauthClient: any) {}

  async getLearnerProfiles(nomisId: string): Promise<LearnerProfiles> {
    if (!app.esweEnabled) {
      return createFlaggedContent([])
    }

    let content: curious.LearnerProfile[] = null
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      content = await this.curiousApi.getLearnerProfiles(context, nomisId)
    } catch (e) {
      log.warn(`Failed to fetch learner profiles. Reason: ${e.message}`)
    }

    return createFlaggedContent(content)
  }

  async getLatestLearningDifficulty(nomisId: string): Promise<FeatureFlagged<string>> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }

    let content: string = null
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()

      // TODO: speak with curious to see if filtering/sorting can be added to their api
      const [educations, profiles] = await Promise.all([
        this.curiousApi.getLearnerEducation(context, nomisId),
        this.curiousApi.getLearnerProfiles(context, nomisId),
      ])

      const compareByDateDesc = (a: curious.LearnerEducation, b: curious.LearnerEducation) => {
        const startDateA = moment(a.learningStartDate, CURIOUS_DATE_FORMAT)
        const startDateB = moment(b.learningStartDate, CURIOUS_DATE_FORMAT)

        if (startDateA.isAfter(startDateB)) {
          return -1
        }
        if (startDateB.isAfter(startDateA)) {
          return 1
        }
        return 0
      }

      educations.sort(compareByDateDesc)

      const profilesByEstablishment = profiles.reduce(
        (acc, current) => ({
          ...acc,
          [current.establishmentId]: current,
        }),
        {}
      )

      const lddHealthProblem = educations
        .map(({ establishmentId }) => profilesByEstablishment[establishmentId]?.lddHealthProblem)
        .find((value) => !!value)

      content = lddHealthProblem ?? ''
    } catch (e) {
      log.warn(`Failed to get latest learning difficulty. Reason: ${e.message}`)
    }

    return createFlaggedContent(content)
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
          label: 'Assessment date',
          value: readableDateFormat(assessmentDate, 'YYYY-MM-DD'),
        },
        {
          label: 'Assessment location',
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
