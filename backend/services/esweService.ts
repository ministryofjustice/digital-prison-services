import moment, { Moment } from 'moment'
import { app } from '../config'
import { readableDateFormat } from '../utils'
import type CuriousApi from '../api/curious/curiousApi'
import log from '../log'
import AssessmentQualificationType from '../api/curious/types/AssessmentQualificationType'

type FeatureFlagged<T> = {
  enabled: boolean
  content: T
}

type LearnerProfiles = FeatureFlagged<curious.LearnerProfile[]>
type LearnerLatestAssessments = FeatureFlagged<curious.FunctionalSkillsLevels>
type OffenderGoals = FeatureFlagged<curious.LearnerGoals>

const createFlaggedContent = <T>(content: T) => ({
  enabled: app.esweEnabled,
  content,
})

const CURIOUS_DATE_FORMAT = 'YYYY-MM-DD'

const DATA_NOT_ADDED = 'Not entered'

const AWAITING_ASSESSMENT_CONTENT = 'Awaiting assessment'

export const DEFAULT_GOALS = {
  employmentGoals: null,
  personalGoals: null,
}

export const DEFAULT_SKILL_LEVELS = {
  english: [
    {
      label: 'English',
      value: AWAITING_ASSESSMENT_CONTENT,
    },
  ],
  maths: [
    {
      label: 'Maths',
      value: AWAITING_ASSESSMENT_CONTENT,
    },
  ],
  digiLit: [
    {
      label: 'Digital Literacy',
      value: AWAITING_ASSESSMENT_CONTENT,
    },
  ],
}

const parseDate = (value: string) => moment(value, CURIOUS_DATE_FORMAT)

const compareByDate = (dateA: Moment, dateB: Moment, descending = true) => {
  const order = descending ? 1 : -1

  if (dateA.isAfter(dateB)) {
    return -1 * order
  }
  if (dateB.isAfter(dateA)) {
    return 1 * order
  }
  return 0
}

const createSkillAssessmentSummary = (learnerAssessment: curious.LearnerAssessment) => {
  const { qualification, establishmentName } = learnerAssessment || {}
  const { qualificationType, qualificationGrade, assessmentDate } = qualification || {}

  if (!assessmentDate) {
    return [
      {
        label: qualificationType,
        value: AWAITING_ASSESSMENT_CONTENT,
      },
    ]
  }

  return [
    {
      label: qualificationType,
      value: qualificationGrade,
    },
    {
      label: 'Assessment date',
      value: readableDateFormat(assessmentDate, CURIOUS_DATE_FORMAT),
    },
    {
      label: 'Assessment location',
      value: establishmentName,
    },
  ]
}

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

      const compareByDateDesc = (a: curious.LearnerEducation, b: curious.LearnerEducation) =>
        compareByDate(parseDate(a.learningStartDate), parseDate(b.learningStartDate))

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
      return createFlaggedContent({})
    }

    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const learnerLatestAssessments = await this.curiousApi.getLearnerLatestAssessments(context, nomisId)

      const getSubjectGrade = (
        functionalSkillLevels: curious.LearnerLatestAssessment[],
        qualificationType: AssessmentQualificationType
      ): curious.LearnerAssessment => {
        const emptyAssessment: curious.LearnerAssessment = {
          qualification: {
            qualificationType,
          },
        }

        if (Array.isArray(functionalSkillLevels) && functionalSkillLevels.length > 0) {
          const { qualifications } = functionalSkillLevels[0]
          const learnerAssessment = qualifications.filter(
            (functionalSkillLevel) => functionalSkillLevel.qualification.qualificationType === qualificationType
          )
          return learnerAssessment[0] || emptyAssessment
        }
        return emptyAssessment
      }

      const englishGrade = getSubjectGrade(learnerLatestAssessments, AssessmentQualificationType.English)
      const mathsGrade = getSubjectGrade(learnerLatestAssessments, AssessmentQualificationType.Maths)
      const digitalLiteracyGrade = getSubjectGrade(
        learnerLatestAssessments,
        AssessmentQualificationType.DigitalLiteracy
      )

      return createFlaggedContent({
        english: createSkillAssessmentSummary(englishGrade),
        maths: createSkillAssessmentSummary(mathsGrade),
        digiLit: createSkillAssessmentSummary(digitalLiteracyGrade),
      })
    } catch (e) {
      if (e.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent(DEFAULT_SKILL_LEVELS)
      }
      log.error(`Failed to get latest learning assessments. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getLearnerGoals(nomisId: string): Promise<OffenderGoals> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const goals = await this.curiousApi.getLearnerGoals(context, nomisId)

      const { employmentGoals, personalGoals } = goals

      if (!employmentGoals.length && !personalGoals.length) {
        return createFlaggedContent(DEFAULT_GOALS)
      }

      const displayedGoals = {
        employmentGoals: employmentGoals.length ? employmentGoals : [DATA_NOT_ADDED],
        personalGoals: personalGoals.length ? personalGoals : [DATA_NOT_ADDED],
      }
      return createFlaggedContent(displayedGoals)
    } catch (e) {
      if (e.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent(DEFAULT_GOALS)
      }
      return createFlaggedContent(null)
    }
  }
}
