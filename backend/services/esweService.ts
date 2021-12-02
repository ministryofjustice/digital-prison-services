import moment, { Moment } from 'moment'
import { app } from '../config'
import { readableDateFormat, stringWithAbbreviationsProcessor } from '../utils'
import type CuriousApi from '../api/curious/curiousApi'
import log from '../log'
import { AssessmentQualificationType } from '../api/curious/types/Enums'
import {
  LearnerAssessment,
  LearnerLatestAssessment,
  LearnerProfile,
  LearnerEducation,
  LearnerEmployabilitySkills,
} from '../api/curious/types/Types'

type FeatureFlagged<T> = {
  enabled: boolean
  content: T
}

type LearnerProfiles = FeatureFlagged<LearnerProfile[]>
type LearnerLatestAssessments = FeatureFlagged<eswe.FunctionalSkillsLevels>
type OffenderGoals = FeatureFlagged<eswe.LearnerGoals>
type Neurodiversities = FeatureFlagged<eswe.Neurodiversities[]>
type CurrentCoursesEnhanced = FeatureFlagged<eswe.CurrentCoursesEnhanced>
type LearnerEducationFullDetails = FeatureFlagged<eswe.LearnerEducationFullDetails>
type CurrentWork = FeatureFlagged<eswe.OffenderCurrentWork>
type activitiesHistory = FeatureFlagged<eswe.activitiesHistory>
type attendanceDetails = FeatureFlagged<eswe.attendanceDetails>

const createFlaggedContent = <T>(content: T) => ({
  enabled: app.esweEnabled,
  content,
})

const DATE_FORMAT = 'YYYY-MM-DD'

const DATA_NOT_ADDED = 'Not entered'

const AWAITING_ASSESSMENT_CONTENT = 'Awaiting assessment'

export const PAGE_SIZE = 20

export const DEFAULT_GOALS = {
  employmentGoals: null,
  personalGoals: null,
  shortTermGoals: null,
  longTermGoals: null,
}

export const DEFAULT_COURSE_DATA = {
  historicalCoursesPresent: false,
  currentCourseData: [],
}

export const DEFAULT_WORK_DATA = {
  workHistoryPresent: false,
  currentJobs: [],
}

export const DEFAULT_TABLE_DATA = {
  fullDetails: [],
  pagination: {
    totalRecords: 0,
    offset: 0,
    limit: PAGE_SIZE,
  },
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

const createSkillAssessmentSummary = (learnerAssessment: LearnerAssessment) => {
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
      value: stringWithAbbreviationsProcessor(establishmentName),
    },
  ]
}

/**
 * Education skills and work experience (ESWE)
 */
export default class EsweService {
  static create(curiousApi: CuriousApi, systemOauthClient: any, prisonApi: any, whereaboutsApi: any): EsweService {
    return new EsweService(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)
  }

  constructor(
    private readonly curiousApi: CuriousApi,
    private readonly systemOauthClient: any,
    private readonly prisonApi: any,
    private readonly whereaboutsApi: any
  ) {}

  callActivitiesHistoryApi = (context, nomisId: string, params) => {
    const oneYearAgo = moment().subtract(1, 'year').format('YYYY-MM-DD')
    return this.prisonApi.getOffenderActivitiesHistory(context, nomisId, oneYearAgo, params)
  }

  async getLearnerProfiles(nomisId: string): Promise<LearnerProfiles> {
    let content: LearnerProfile[] = null
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      content = await this.curiousApi.getLearnerProfiles(context, nomisId)
    } catch (e) {
      log.warn(`Failed to fetch learner profiles. Reason: ${e.message}`)
    }

    return createFlaggedContent(content)
  }

  async getLearnerEmployabilitySkills(nomisId: string): Promise<LearnerEmployabilitySkills> {
    let result: LearnerEmployabilitySkills = null
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      result = await this.curiousApi.getLearnerEmployabilitySkills(context, nomisId)
    } catch (e) {
      log.warn(`Failed in getLearnerEmployabilitySkills. Reason: ${e.message}`)
    }

    return result
  }

  async getNeurodiversities(nomisId: string): Promise<Neurodiversities> {
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
                  { label: 'Location', value: stringWithAbbreviationsProcessor(profile.establishmentName) },
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
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const learnerLatestAssessments = await this.curiousApi.getLearnerLatestAssessments(context, nomisId)

      const getSubjectGrade = (
        functionalSkillLevels: LearnerLatestAssessment[],
        qualificationType: AssessmentQualificationType
      ): LearnerAssessment => {
        const emptyAssessment: LearnerAssessment = {
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
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const goals = await this.curiousApi.getLearnerGoals(context, nomisId)

      const { employmentGoals, personalGoals, longTermGoals, shortTermGoals } = goals

      if (!employmentGoals.length && !personalGoals.length && !longTermGoals.length && !shortTermGoals.length) {
        return createFlaggedContent(DEFAULT_GOALS)
      }

      const displayedGoals = {
        employmentGoals: employmentGoals.length ? employmentGoals : [DATA_NOT_ADDED],
        personalGoals: personalGoals.length ? personalGoals : [DATA_NOT_ADDED],
        longTermGoals: longTermGoals.length ? longTermGoals : [DATA_NOT_ADDED],
        shortTermGoals: shortTermGoals.length ? shortTermGoals : [DATA_NOT_ADDED],
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
            label: course.completionStatus.includes('temporarily')
              ? `${course.courseName} (prisoner temporarily withdrawn)`
              : course.courseName,
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

  async getLearnerEducationFullDetails(nomisId: string, page: number): Promise<LearnerEducationFullDetails> {
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const courses = await this.curiousApi.getLearnerEducation(
        context,
        nomisId,
        'learningPlannedEndDate,desc',
        false,
        null,
        page,
        PAGE_SIZE
      )

      const { content } = courses

      const getOutcome = (course: LearnerEducation) => {
        if (course.outcomeGrade) return course.outcomeGrade
        if (course.completionStatus.includes('continuing')) return 'In progress'
        if (course.completionStatus.includes('temporarily withdrawn')) return 'Temporarily withdrawn'
        if (course.completionStatus.includes('withdrawn') && !course.completionStatus.includes('temporarily'))
          return 'Withdrawn'
        return 'Completed'
      }

      const getOutcomeDetails = (course: LearnerEducation) => {
        if (course.outcome && !course.completionStatus.includes('withdrawn')) return course.outcome
        if (course.prisonWithdrawalReason) return course.prisonWithdrawalReason
        return ''
      }

      if (content.length) {
        const fullDetails = content.map((course) => ({
          type: course.isAccredited ? 'Accredited' : 'Non-accredited',
          courseName: course.courseName,
          location: stringWithAbbreviationsProcessor(course.establishmentName),
          dateFrom: course.learningStartDate,
          dateTo: course.learningActualEndDate ? course.learningActualEndDate : course.learningPlannedEndDate,
          outcome: getOutcome(course),
          outcomeDetails: getOutcomeDetails(course),
        }))

        fullDetails.sort((a, b) => compareByDate(parseDate(a.dateTo), parseDate(b.dateTo), true))

        const withPagination = {
          fullDetails,
          pagination: {
            totalRecords: courses.totalElements,
            offset: courses.pageable.offset,
            limit: courses.pageable.pageSize,
          },
        }

        return createFlaggedContent(withPagination)
      }
      return createFlaggedContent(DEFAULT_TABLE_DATA)
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Curious.`)
        return createFlaggedContent(DEFAULT_TABLE_DATA)
      }
      log.error(`Failed to get learner education. Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getCurrentActivities(whereaboutsContext, nomisId: string): Promise<CurrentWork> {
    const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD')
    let unacceptableAbsenceSummary
    let currentWorkData = DEFAULT_WORK_DATA
    try {
      const sixMonthCheck = await this.whereaboutsApi.getUnacceptableAbsences(
        whereaboutsContext,
        nomisId,
        moment().subtract(6, 'month').format('YYYY-MM-DD'),
        yesterday
      )
      const thirtyDaySummary = await this.whereaboutsApi.getUnacceptableAbsences(
        whereaboutsContext,
        nomisId,
        moment().subtract(30, 'd').format('YYYY-MM-DD'),
        yesterday
      )
      unacceptableAbsenceSummary = { ...thirtyDaySummary, noneInSixMonths: sixMonthCheck.unacceptableAbsence === 0 }
    } catch (e) {
      log.error(e, 'Failed to get learner unacceptable absences')
      unacceptableAbsenceSummary = null
    }
    try {
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const prisonerDetails = await this.prisonApi.getPrisonerDetails(context, nomisId)
      // Set page size to get all
      const workActivities = await this.callActivitiesHistoryApi(context, nomisId, { size: 1000 })

      const { content } = workActivities
      const { latestLocation } = prisonerDetails[0]

      if (content.length && latestLocation) {
        const currentJobs = content
          .filter((job) => job.isCurrentActivity && job.agencyLocationDescription === latestLocation)
          .map((job) => ({
            label: job.description.trim(),
            value: `Started on ${readableDateFormat(job.startDate, DATE_FORMAT)}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
        currentWorkData = { workHistoryPresent: true, currentJobs }
      }
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found.`)
      } else {
        currentWorkData = null
      }
      log.error(e, 'Failed in getCurrentActivities()')
    }
    return createFlaggedContent({ currentWorkData, unacceptableAbsenceSummary })
  }

  async getActivitiesHistoryDetails(nomisId: string, page: number): Promise<activitiesHistory> {
    try {
      const sort = 'endDate,desc'
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const workActivities = await this.callActivitiesHistoryApi(context, nomisId, { page, sort })

      const { content } = workActivities

      const getEndDate = (job: eswe.WorkActivity) => {
        if (job.isCurrentActivity) return null
        return job.endDate
      }

      if (content.length) {
        const fullDetails = content
          .map((job) => ({
            role: job.description.trim(),
            location: job.agencyLocationDescription,
            startDate: job.startDate,
            endDate: getEndDate(job),
            endReason: job.endReasonDescription || null,
            endComment: job.endCommentText || null,
          }))
          .sort((a, b) => compareByDate(parseDate(a.endDate), parseDate(b.endDate), true))

        const withPagination = {
          fullDetails,
          pagination: {
            totalRecords: workActivities.totalElements,
            offset: workActivities.pageable.offset,
            limit: workActivities.pageable.pageSize,
          },
        }

        return createFlaggedContent(withPagination)
      }
      return createFlaggedContent(DEFAULT_TABLE_DATA)
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in prison-api.`)
        return createFlaggedContent(DEFAULT_TABLE_DATA)
      }
      log.error(`Failed in getActivitiesHistoryDetails(). Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }

  async getAttendanceDetails(nomisId: string, page: number): Promise<attendanceDetails> {
    try {
      // const sort = 'endDate,desc'
      const context = await this.systemOauthClient.getClientCredentialsTokens()
      const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD')
      const sixMonthsAgo = moment().subtract(6, 'month').format('YYYY-MM-DD')
      const data = await this.whereaboutsApi.getUnacceptableAbsenceDetail(
        context,
        nomisId,
        yesterday,
        sixMonthsAgo,
        page
      )

      // const fullDetails =
      //   .map((job) => ({
      //     role: job.description.trim(),
      //     location: job.agencyLocationDescription,
      //     startDate: job.startDate,
      //     endDate: getEndDate(job),
      //     endReason: job.endReasonDescription || null,
      //     endComment: job.endCommentText || null,
      //   }))
      //   .sort((a, b) => compareByDate(parseDate(a.endDate), parseDate(b.endDate), true))

      const withPagination = {
        fullDetails: data.content,
        pagination: {
          totalRecords: data.totalElements,
          offset: data.pageable.offset,
          limit: data.pageable.pageSize,
        },
      }

      return createFlaggedContent(withPagination)
    } catch (e) {
      if (e.response?.status === 404) {
        log.info(`Offender record not found in Whereabouts api.`)
        return createFlaggedContent(DEFAULT_TABLE_DATA)
      }
      log.error(`Failed in getAttendanceDetails(). Reason: ${e.message}`)
    }
    return createFlaggedContent(null)
  }
}
