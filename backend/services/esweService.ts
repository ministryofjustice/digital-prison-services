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
type LearnerLatestAssessments = FeatureFlagged<eswe.FunctionalSkillsLevels>
type OffenderGoals = FeatureFlagged<curious.LearnerGoals>
type LearningDifficulties = FeatureFlagged<eswe.LearningDifficultiesDisabilities[]>
type CurrentCoursesEnhanced = FeatureFlagged<eswe.CurrentCoursesEnhanced>
type LearnerEducationFullDetails = FeatureFlagged<eswe.LearnerEducationFullDetails[]>
type CurrentWork = FeatureFlagged<eswe.OffenderCurrentWork>

const createFlaggedContent = <T>(content: T) => ({
  enabled: app.esweEnabled,
  content,
})

const DATE_FORMAT = 'YYYY-MM-DD'

const DATA_NOT_ADDED = 'Not entered'

const AWAITING_ASSESSMENT_CONTENT = 'Awaiting assessment'

export const DEFAULT_GOALS = {
  employmentGoals: null,
  personalGoals: null,
}

export const DEFAULT_COURSE_DATA = {
  historicalCoursesPresent: false,
  currentCourseData: [],
}

export const DEFAULT_WORK_DATA = {
  workHistoryPresent: false,
  currentJobs: [],
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

const parseDate = (value: string) => moment(value, DATE_FORMAT)

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
      value: readableDateFormat(assessmentDate, DATE_FORMAT),
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
  static create(curiousApi: CuriousApi, systemOauthClient: any, prisonApi: any): EsweService {
    return new EsweService(curiousApi, systemOauthClient, prisonApi)
  }

  constructor(
    private readonly curiousApi: CuriousApi,
    private readonly systemOauthClient: any,
    private readonly prisonApi: any
  ) {}

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

  async getLearningDifficulties(nomisId: string): Promise<LearningDifficulties> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }

    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const profiles = await this.curiousApi.getLearnerProfiles(context, nomisId)

      if (profiles?.length) {
        const lddList = profiles
          .map((profile) => {
            if (profile.primaryLDDAndHealthProblem) {
              const combinedLdd = [profile.primaryLDDAndHealthProblem, ...profile.additionalLDDAndHealthProblems.sort()]
              return {
                establishmentName: profile.establishmentName,
                details: [
                  { label: 'Description', ldd: combinedLdd },
                  { label: 'Location', value: profile.establishmentName },
                ],
              }
            }
            return null
          })
          .filter((profile) => profile)
          .sort((a, b) => {
            if (a.establishmentName < b.establishmentName) return -1
            if (a.establishmentName > b.establishmentName) return 1
            return 0
          })

        return createFlaggedContent(lddList)
      }
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent([])
      }
      log.error(`Failed to get learning difficulties. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
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
      if (e.response?.status === 404) {
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
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent(DEFAULT_GOALS)
      }
      log.error(`Failed to get learner goals. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getLearnerEducation(nomisId: string): Promise<CurrentCoursesEnhanced> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }

    const compareByDateAsc = (a, b) =>
      compareByDate(parseDate(a.learningPlannedEndDate), parseDate(b.learningPlannedEndDate), false)

    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const courses = await this.curiousApi.getLearnerEducation(context, nomisId)

      const { content } = courses

      if (content.length) {
        const currentCourses = content
          .filter(
            (course) =>
              course.completionStatus.includes('continuing') || course.completionStatus.includes('temporarily')
          )
          .sort(compareByDateAsc)
          .map((course) => ({
            label: course.courseName,
            value: `Planned end date on ${readableDateFormat(course.learningPlannedEndDate, DATE_FORMAT)}`,
          }))

        const fullCourseData = {
          historicalCoursesPresent: content.length > currentCourses.length,
          currentCourseData: currentCourses,
        }
        return createFlaggedContent(fullCourseData)
      }
      return createFlaggedContent(DEFAULT_COURSE_DATA)
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent(DEFAULT_COURSE_DATA)
      }
      log.error(`Failed to get learner education. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getLearnerEducationFullDetails(nomisId: string): Promise<LearnerEducationFullDetails> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const courses = await this.curiousApi.getLearnerEducation(context, nomisId)

      const { content } = courses

      const getOutcome = (course: curious.LearnerCourses) => {
        if (course.outcomeGrade) return course.outcomeGrade
        if (course.completionStatus.includes('continuing')) return 'In progress'
        if (course.completionStatus.includes('temporarily withdrawn')) return 'Temporarily withdrawn'
        if (course.completionStatus.includes('withdrawn') && !course.completionStatus.includes('temporarily'))
          return 'Withdrawn'
        return 'Completed'
      }

      const getOutcomeDetails = (course: curious.LearnerCourses) => {
        if (course.outcome && !course.completionStatus.includes('withdrawn')) return course.outcome
        if (course.prisonWithdrawalReason) return course.prisonWithdrawalReason
        return ''
      }

      if (content.length) {
        const fullCourseDetails = content.map((course) => ({
          type: course.isAccredited ? 'Accredited' : 'Non-accredited',
          courseName: course.courseName,
          location: course.establishmentName,
          dateFrom: course.learningStartDate,
          dateTo: course.learningActualEndDate ? course.learningActualEndDate : course.learningPlannedEndDate,
          outcome: getOutcome(course),
          outcomeDetails: getOutcomeDetails(course),
        }))

        fullCourseDetails.sort((a, b) => compareByDate(parseDate(a.dateTo), parseDate(b.dateTo), true))

        return createFlaggedContent(fullCourseDetails)
      }
      return createFlaggedContent([])
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent([])
      }
      log.error(`Failed to get learner education. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getCurrentWork(nomisId: string): Promise<CurrentWork> {
    if (!app.esweEnabled) {
      return createFlaggedContent(null)
    }

    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const oneYearAgo = moment().subtract(1, 'year').format('YYYY-MM-DD')
      const workHistory = await this.prisonApi.getOffenderWorkHistory(context, nomisId, oneYearAgo)

      const { workActivities } = workHistory

      if (workActivities.length) {
        const currentJobs = workActivities
          .filter((job) => job.isCurrentActivity)
          .map((job) => ({
            label: job.description.trim(),
            value: `Started on ${readableDateFormat(job.startDate, DATE_FORMAT)}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
        const currentWorkData = {
          workHistoryPresent: true,
          currentJobs,
        }
        return createFlaggedContent(currentWorkData)
      }
      return createFlaggedContent(DEFAULT_WORK_DATA)
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found.`)
        return createFlaggedContent(DEFAULT_WORK_DATA)
      }
      log.error(`Failed to get learner work history. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }
}
