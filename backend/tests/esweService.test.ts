import moment from 'moment'
import EsweService, {
  DEFAULT_SKILL_LEVELS,
  DEFAULT_GOALS,
  DEFAULT_COURSE_DATA,
  DEFAULT_WORK_DATA,
  DEFAULT_TABLE_DATA,
} from '../services/esweService'
import { makeNotFoundError } from './helpers'
import { app } from '../config'
import CuriousApi from '../api/curious/curiousApi'
import {
  AssessmentQualificationType,
  EmployabilitySkill,
  LearnerEducationDeliveryMethodType,
} from '../api/curious/types/Enums'
import {
  EmployabilitySkillsReview,
  LearnerGoals,
  LearnerLatestAssessment,
  LearnerProfile,
  PageLearnerEducation,
  LearnerNeurodivergence,
  // eslint-disable-next-line-NO import/extensions
} from '../api/curious/types/Types'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

const sixMonthsAgo = moment().startOf('day').subtract(6, 'month')
const yesterday = moment().startOf('day').subtract(1, 'd')

describe('Education skills and work experience', () => {
  const dummyLearnerProfiles = getDummyLearnerProfiles()
  const dummyEducations = getDummyEducations()
  const dummyGoals = getDummyGoals()
  const dummyActivitiesHistory = getdummyActivitiesHistory()
  const dummyPrisonerDetails = getDummyPrisonerDetails()
  const credentialsRef = {}
  const curiousApi = {} as CuriousApi
  const prisonApi = {} as any
  const whereaboutsApi = {} as any
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  const dummyNeurodivergence = getDummyLearnerDivergence()
  const whereaboutsContext = 'TOKEN'
  let service
  let getLearnerProfilesMock
  let getLearnerEducationMock
  let getLearnerLatestAssessmentsMock
  let getLearnerGoalsMock
  let getLearnerActivitiesHistoryMock
  let getPrisonerDetailsMock
  let getUnacceptableAbsencesMock
  let getUnacceptableAbsenceDetailMock
  let getLearnerEmployabilitySkillsMock
  let getLearnerdivergenceMock
  beforeEach(() => {
    getLearnerProfilesMock = jest.fn()
    getLearnerEducationMock = jest.fn()
    getLearnerLatestAssessmentsMock = jest.fn()
    getLearnerGoalsMock = jest.fn()
    getLearnerActivitiesHistoryMock = jest.fn()
    getPrisonerDetailsMock = jest.fn()
    getUnacceptableAbsencesMock = jest.fn()
    getUnacceptableAbsenceDetailMock = jest.fn()
    getLearnerEmployabilitySkillsMock = jest.fn()
    getLearnerdivergenceMock = jest.fn()
    curiousApi.getLearnerProfiles = getLearnerProfilesMock
    curiousApi.getLearnerEducation = getLearnerEducationMock
    curiousApi.getLearnerLatestAssessments = getLearnerLatestAssessmentsMock
    curiousApi.getLearnerGoals = getLearnerGoalsMock
    curiousApi.getLearnerNeurodivergence = getLearnerdivergenceMock
    curiousApi.getLearnerEmployabilitySkills = getLearnerEmployabilitySkillsMock
    prisonApi.getOffenderActivitiesHistory = getLearnerActivitiesHistoryMock
    whereaboutsApi.getUnacceptableAbsences = getUnacceptableAbsencesMock
    whereaboutsApi.getUnacceptableAbsenceDetail = getUnacceptableAbsenceDetailMock
    prisonApi.getPrisonerDetails = getPrisonerDetailsMock
    systemOauthClient.getClientCredentialsTokens.mockReset()
    jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

    getLearnerProfilesMock.mockResolvedValue(dummyLearnerProfiles)
    getLearnerEducationMock.mockResolvedValue(dummyEducations)
    getLearnerGoalsMock.mockResolvedValue(dummyGoals)
    getLearnerActivitiesHistoryMock.mockResolvedValue(dummyActivitiesHistory)
    getPrisonerDetailsMock.mockResolvedValue(dummyPrisonerDetails)
    getLearnerdivergenceMock.mockResolvedValue(dummyNeurodivergence)

    systemOauthClient.getClientCredentialsTokens.mockReturnValue(credentialsRef)
    service = EsweService.create(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)
  })

  describe('learner profiles', () => {
    const nomisId = 'G2823GV'

    it('should set enabled to true', async () => {
      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual(dummyLearnerProfiles)
      expect(getLearnerProfilesMock).toHaveBeenCalledTimes(1)
      expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
      expect(getLearnerProfilesMock).toHaveBeenCalledWith(credentialsRef, nomisId)
    })

    it('should return null content', async () => {
      getLearnerProfilesMock.mockRejectedValue(new Error('error'))

      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.content).toBeNull()
    })
  })

  describe('Learning difficulties', () => {
    const nomisId = 'G8930UW'

    it('should return null content on error', async () => {
      getLearnerProfilesMock.mockRejectedValue(new Error('error'))
      const actual = await service.getNeurodiversities(nomisId)
      expect(actual.content).toBeNull()
    })

    it('should return expected response when the prisoner is not registered in Curious', async () => {
      getLearnerProfilesMock.mockRejectedValue(makeNotFoundError())
      const actual = await service.getNeurodiversities(nomisId)
      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual([])
    })
    it('should return expected response when the prisoner is in Curious but has listed no LDD information', async () => {
      const noLDD = [
        {
          prn: 'G3609VL',
          establishmentName: 'HMP New Hall',
          primaryLDDAndHealthProblem: null,
          additionalLDDAndHealthProblems: [],
        },
      ]
      getLearnerProfilesMock.mockResolvedValue(noLDD)
      const actual = await service.getNeurodiversities(nomisId)
      expect(actual.content).toStrictEqual([])
      expect(getLearnerProfilesMock).toHaveBeenCalledTimes(1)
      expect(getLearnerProfilesMock).toHaveBeenCalledWith(credentialsRef, nomisId)
    })
    it('should return expected response when the prisoner is in Curious and there is LDD information from one caseload', async () => {
      const oneCaseloadLDD = [
        {
          prn: 'G6123VU',
          establishmentName: 'HMP Moorland',
          lddHealthProblem:
            'Learner considers himself or herself to have a learning difficulty and/or disability and/or health problem.',
          primaryLDDAndHealthProblem: 'Visual impairment',
          additionalLDDAndHealthProblems: [
            'Hearing impairment',
            'Social and emotional difficulties',
            'Mental health difficulty',
          ],
        },
      ]
      const expected = [
        {
          details: [
            {
              ldd: [
                'Visual impairment',
                'Hearing impairment',
                'Mental health difficulty',
                'Social and emotional difficulties',
              ],
              label: 'Description',
            },
            {
              label: 'Location',
              value: 'HMP Moorland',
            },
          ],
          establishmentName: 'HMP Moorland',
        },
      ]
      getLearnerProfilesMock.mockResolvedValue(oneCaseloadLDD)
      const actual = await service.getNeurodiversities(nomisId)
      expect(actual.content).toStrictEqual(expected)
    })
    it('should order the LDD information alphabetically by establishment name if there is data from multiple caseloads, and ignore caseloads where there are no LDD listed', async () => {
      const expected = [
        {
          details: [
            {
              ldd: [
                'Visual impairment',
                'Hearing impairment',
                'Mental health difficulty',
                'Social and emotional difficulties',
              ],
              label: 'Description',
            },
            {
              label: 'Location',
              value: 'HMP Moorland',
            },
          ],
          establishmentName: 'HMP Moorland',
        },
        {
          details: [
            {
              ldd: ['Dyslexia', 'Autism', 'Hearing impairment', 'Social and emotional difficulties'],
              label: 'Description',
            },
            {
              label: 'Location',
              value: 'HMP New Hall',
            },
          ],
          establishmentName: 'HMP New Hall',
        },
      ]
      getLearnerProfilesMock.mockResolvedValue(dummyLearnerProfiles)
      const actual = await service.getNeurodiversities(nomisId)
      expect(actual.content).toStrictEqual(expected)
    })
  })

  describe('Courses and qualifications details', () => {
    const nomisId = 'G8930UW'

    it('should return null content on error', async () => {
      getLearnerEducationMock.mockRejectedValue(new Error('error'))
      const actual = await service.getLearnerEducationFullDetails(nomisId)
      expect(actual.content).toBeNull()
    })

    it('should return expected response when the prisoner is not registered in Curious', async () => {
      getLearnerEducationMock.mockRejectedValue(makeNotFoundError())
      const actual = await service.getLearnerEducationFullDetails(nomisId)
      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual(DEFAULT_TABLE_DATA)
    })

    it('should return expected response when the prisoner is in Curious but has no courses', async () => {
      getLearnerEducationMock.mockResolvedValue({ content: [] })
      const actual = await service.getLearnerEducationFullDetails(nomisId)
      expect(actual.content).toStrictEqual(DEFAULT_TABLE_DATA)
    })

    it('should return the expected response, sorted by dateTo descending, when the prisoner is in Curious with courses', async () => {
      const expected = [
        {
          courseName: 'Foundation Degree in Arts in Equestrian Practice and Technology',
          dateFrom: '2021-07-19',
          dateTo: '2021-07-21',
          location: 'HMP Moorland',
          outcome: 'Completed',
          outcomeDetails: 'No achievement<br/>Fail',
          type: 'Accredited',
        },
        {
          courseName: 'Certificate of Management',
          dateFrom: '2021-07-01',
          dateTo: '2021-07-08',
          location: 'HMP Moorland',
          outcome: 'Withdrawn',
          outcomeDetails: 'Changes in their risk profile meaning they can no longer take part in the learning',
          type: 'Accredited',
        },
        {
          courseName: 'Human Science',
          dateFrom: '2020-09-01',
          dateTo: '2020-12-02',
          location: 'HMP Moorland',
          outcome: 'Completed',
          outcomeDetails: 'Achieved<br/>Pass',
          type: 'Non-accredited',
        },
        {
          courseName: 'Ocean Science',
          dateFrom: '2019-12-15',
          dateTo: '2020-03-31',
          location: 'HMP Bristol',
          outcome: 'Temporarily withdrawn',
          outcomeDetails: 'Significant ill health causing them to be unable to attend education',
          type: 'Non-accredited',
        },
        {
          courseName: 'Foundation Degree in Cricket Coaching - (Myerscough College)',
          dateFrom: '2019-10-01',
          dateTo: '2019-10-02',
          location: 'HMP Dartmoor',
          outcome: 'Withdrawn',
          outcomeDetails: 'Changes in their risk profile meaning they can no longer take part in the learning',
          type: 'Accredited',
        },
        {
          courseName: 'Instructing group cycling sessions',
          dateFrom: '2019-08-01',
          dateTo: '2019-08-01',
          location: 'HMP Leyhill',
          outcome: 'In progress',
          outcomeDetails: '',
          type: 'Accredited',
        },
      ]

      getLearnerEducationMock.mockResolvedValue(dummyEducations)
      const actual = await service.getLearnerEducationFullDetails(nomisId, 2)
      expect(actual.content).toEqual({
        fullDetails: expected,
        pagination: { limit: 10, offset: 0, totalRecords: 6 },
      })
    })
  })

  describe('Work inside prison details', () => {
    const nomisId = 'G8930UW'
    it('should return null content on error', async () => {
      getLearnerActivitiesHistoryMock.mockRejectedValue(new Error('error'))
      const actual = await service.getActivitiesHistoryDetails(nomisId)
      expect(actual.content).toBeNull()
    })
    it('should return expected response when the prisoner is not found', async () => {
      getLearnerActivitiesHistoryMock.mockRejectedValue(makeNotFoundError())
      const actual = await service.getActivitiesHistoryDetails(nomisId)
      expect(actual.content).toEqual(DEFAULT_TABLE_DATA)
    })
    it('should return the expected response if the user has no work', async () => {
      getLearnerActivitiesHistoryMock.mockResolvedValue({ content: [] })
      const actual = await service.getActivitiesHistoryDetails(nomisId)
      expect(actual.content).toEqual(DEFAULT_TABLE_DATA)
    })
    it('should return the expected response if the user has work', async () => {
      const expected = {
        fullDetails: [
          {
            endComment: null,
            endDate: null,
            endReason: null,
            location: 'Moorland (HMP & YOI)',
            role: 'Cleaner BB1 AM',
            startDate: '2021-08-19',
          },
          {
            endComment: null,
            endDate: null,
            endReason: null,
            location: 'Wayland (HMP)',
            role: 'Library AM',
            startDate: '2020-06-18',
          },
          {
            endComment: null,
            endDate: '2021-07-23',
            endReason: null,
            location: 'Moorland (HMP & YOI)',
            role: 'Cleaner HB1 AM',
            startDate: '2021-07-20',
          },
          {
            endComment: 'John has been throwing bricks at teacher',
            endDate: '2021-07-22',
            endReason: 'Unacceptable behaviour',
            location: 'Moorland (HMP & YOI)',
            role: 'Library HB1 AM',
            startDate: '2019-07-20',
          },
          {
            endComment: null,
            endDate: '2021-05-11',
            endReason: null,
            location: 'Moorland (HMP & YOI)',
            role: 'Cleaner HB1 PM',
            startDate: '2021-07-20',
          },
        ],
        pagination: { limit: 20, offset: 0, totalRecords: 5 },
      }
      getLearnerActivitiesHistoryMock.mockResolvedValue(dummyActivitiesHistory)
      const actual = await service.getActivitiesHistoryDetails(nomisId)
      expect(actual.content).toEqual(expected)
    })
  })

  describe('Unacceptable absences details', () => {
    const nomisId = 'G8930UW'

    it('should return null content on error', async () => {
      getUnacceptableAbsenceDetailMock.mockRejectedValue(new Error('error'))
      const actual = await service.getAttendanceDetails(nomisId)
      expect(actual.content).toBeNull()
    })

    it('should return expected response when the prisoner is not found', async () => {
      getUnacceptableAbsenceDetailMock.mockRejectedValue(makeNotFoundError())
      const actual = await service.getAttendanceDetails(nomisId)
      expect(actual.content).toEqual({
        ...DEFAULT_TABLE_DATA,
        dateRange: { fromDate: sixMonthsAgo, toDate: yesterday },
      })
    })

    it('should return the expected response if the user has no data', async () => {
      getUnacceptableAbsenceDetailMock.mockResolvedValue({
        content: [],
        pageable: { offset: 0, pageSize: 20 },
        totalElements: 0,
      })

      const actual = await service.getAttendanceDetails(nomisId, 3)

      expect(actual.content).toEqual({
        ...DEFAULT_TABLE_DATA,
        dateRange: { fromDate: sixMonthsAgo, toDate: yesterday },
      })
      expect(getUnacceptableAbsenceDetailMock).toHaveBeenCalledWith(
        credentialsRef,
        nomisId,
        sixMonthsAgo.format('YYYY-MM-DD'),
        yesterday.format('YYYY-MM-DD'),
        3
      )
    })

    it('should return the expected response if the user has data', async () => {
      const list = [
        { eventDate: '2021-09-21', activity: 'Activity1' },
        { eventDate: '2021-09-22', activity: 'Activity2' },
      ]
      const expected = {
        fullDetails: list,
        dateRange: { fromDate: sixMonthsAgo, toDate: yesterday },
        pagination: { limit: 20, offset: 0, totalRecords: 2 },
      }
      getUnacceptableAbsenceDetailMock.mockResolvedValue({
        content: list,
        pageable: { offset: 0, pageSize: 20 },
        totalElements: 2,
      })

      const actual = await service.getAttendanceDetails(nomisId, 4)

      expect(actual.content).toEqual(expected)
      expect(getUnacceptableAbsenceDetailMock).toHaveBeenCalledWith(
        credentialsRef,
        nomisId,
        sixMonthsAgo.format('YYYY-MM-DD'),
        yesterday.format('YYYY-MM-DD'),
        4
      )
    })
  })

  describe('Employability Skills Details', () => {
    const nomisId = 'G3609VL'

    it('should return null content on error', async () => {
      getLearnerEmployabilitySkillsMock.mockRejectedValue(new Error('error'))

      const actual = await service.getLearnerEmployabilitySkillsDetails(nomisId)

      expect(actual.content).toBeNull()
    })

    it('should return expected response when the prisoner is not registered in Curious', async () => {
      getLearnerEmployabilitySkillsMock.mockRejectedValue(makeNotFoundError())

      const actual = await service.getLearnerEmployabilitySkillsDetails(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual(new Map<EmployabilitySkill, EmployabilitySkillsReview>())
    })

    it('should return all reviews where there are skills present', async () => {
      getLearnerEmployabilitySkillsMock.mockResolvedValue(employabilitySkillsData)
      const expected = new Map()
        .set('skill1', [review1, review3, latestReview1])
        .set('skill2', [latestReview2, review2])

      const actual = await service.getLearnerEmployabilitySkillsDetails(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual(expected)
    })
  })

  describe('Work and skills tab', () => {
    describe('Functional skills level', () => {
      const nomisId = 'G2823GV'

      it('should return expected response when there is one assessment of each skill available', async () => {
        const dummyFunctionalSkillsLevels: LearnerLatestAssessment = {
          prn: 'G8346GA',
          qualifications: [
            {
              establishmentId: 'WIN',
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: AssessmentQualificationType.English,
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-05-02',
              },
            },
            {
              establishmentId: 'WIN',
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: AssessmentQualificationType.DigitalLiteracy,
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-06-01',
              },
            },
            {
              establishmentId: 'WIN',
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: AssessmentQualificationType.Maths,
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-05-27',
              },
            },
          ],
        }

        getLearnerLatestAssessmentsMock.mockResolvedValue([dummyFunctionalSkillsLevels])
        const expectedResult = {
          digiLit: [
            { label: 'Digital Literacy', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '1 June 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          english: [
            { label: 'English', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '2 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          maths: [
            { label: 'Maths', value: 'Entry Level 1' },
            { label: 'Assessment date', value: '27 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
        }

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(expectedResult)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      })
      it('should return expected response when there are no assessments available for a subject', async () => {
        const dummyFunctionalSkillsLevels = {
          prn: 'G8930UW',
          qualifications: [
            {
              establishmentId: 'MDI',
              establishmentName: 'HMP Moorland',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-07-01',
              },
            },
            {
              establishmentId: 'MDI',
              establishmentName: 'HMP Moorland',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-07-01',
              },
            },
          ],
        }

        getLearnerLatestAssessmentsMock.mockResolvedValue([dummyFunctionalSkillsLevels])
        const expectedResult = {
          digiLit: [
            { label: 'Digital Literacy', value: 'Entry Level 1' },
            { label: 'Assessment date', value: '1 July 2021' },
            { label: 'Assessment location', value: 'HMP Moorland' },
          ],
          maths: [
            { label: 'Maths', value: 'Entry Level 1' },
            { label: 'Assessment date', value: '1 July 2021' },
            { label: 'Assessment location', value: 'HMP Moorland' },
          ],
          english: [{ label: 'English', value: 'Awaiting assessment' }],
        }

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(expectedResult)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      })

      it('should return the expected response when there are no assessments available for any subejct', async () => {
        getLearnerLatestAssessmentsMock.mockResolvedValue([])

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(DEFAULT_SKILL_LEVELS)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      })

      it('should return expected response when the prisoner is not registered in Curious', async () => {
        getLearnerLatestAssessmentsMock.mockRejectedValue(makeNotFoundError())
        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(DEFAULT_SKILL_LEVELS)
      })
      it('should return null content on error', async () => {
        getLearnerLatestAssessmentsMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.content).toBeNull()
      })
    })

    describe('Goals', () => {
      const nomisId = 'G3609VL'
      it('should return null content on error', async () => {
        getLearnerGoalsMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.content).toBeNull()
      })
      it('should return expected response when the prisoner is not registered in Curious', async () => {
        getLearnerGoalsMock.mockRejectedValue(makeNotFoundError())
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(DEFAULT_GOALS)
      })
      it('should return the expected response if there are no goals available', async () => {
        const emptyResponse = {
          prn: 'G9981UK',
          employmentGoals: [],
          personalGoals: [],
          longTermGoals: [],
          shortTermGoals: [],
        }
        getLearnerGoalsMock.mockResolvedValue(emptyResponse)
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(DEFAULT_GOALS)
      })
      it('should return the expected response if there are goals available for all goal types', async () => {
        const expected = {
          employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
          personalGoals: ['To support my family', 'To be healthy'],
          longTermGoals: ['I would like to own my own flat', 'I would like a full time job'],
          shortTermGoals: ['I would like to improve my English skills'],
        }
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(expected)
      })
      it('should return the expected response if there are goals available for just one goal type', async () => {
        const expected = {
          employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
          personalGoals: ['Not entered'],
          longTermGoals: ['Not entered'],
          shortTermGoals: ['Not entered'],
        }
        getLearnerGoalsMock.mockResolvedValue({
          prn: 'G3609VL',
          employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
          personalGoals: [],
          longTermGoals: [],
          shortTermGoals: [],
        })
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(expected)
      })
    })

    describe('Courses and qualifications', () => {
      const nomisId = 'G3609VL'
      it('should return null content on error', async () => {
        getLearnerEducationMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toBeNull()
      })
      it('should call the endpoint with the correct prn and context', async () => {
        await service.getLearnerEducation(nomisId)
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
        expect(getLearnerEducationMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      })
      it('should return expected response when the prisoner is not registered in Curious', async () => {
        getLearnerEducationMock.mockRejectedValue(makeNotFoundError())
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(DEFAULT_COURSE_DATA)
      })
      it('should return the expected response if the user has no courses', async () => {
        getLearnerEducationMock.mockResolvedValue({ content: [] })
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(DEFAULT_COURSE_DATA)
      })
      it('should return the expected response if there are only current courses and no historical courses', async () => {
        const courses = {
          content: [
            {
              prn: 'G3609VL',
              courseName: 'Human Science',
              learningPlannedEndDate: '2022-01-05',
              completionStatus:
                'The learner is continuing or intending to continue the learning activities leading to the learning aim',
            },
            {
              prn: 'G3609VL',
              courseName: 'Ocean Science',
              learningPlannedEndDate: '2023-09-30',
              completionStatus:
                'The learner is continuing or intending to continue the learning activities leading to the learning aim',
            },
          ],
        }
        const expected = {
          historicalCoursesPresent: false,
          currentCourseData: [
            { label: 'Human Science', value: `Planned end date on 5 January 2022` },
            { label: 'Ocean Science', value: `Planned end date on 30 September 2023` },
          ],
        }
        getLearnerEducationMock.mockResolvedValue(courses)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(expected)
      })
      it('should return the expected response if there are only historical courses and no current courses', async () => {
        const courses = {
          content: [
            {
              prn: 'G3609VL',
              courseName: 'Human Science',
              learningPlannedEndDate: '2021-01-05',
              completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
            },
            {
              prn: 'G3609VL',
              courseName: 'Ocean Science',
              learningPlannedEndDate: '2021-09-03',
              completionStatus: 'The learner has completed the learning activities leading to the learning aim',
            },
          ],
        }
        const expected = {
          historicalCoursesPresent: true,
          currentCourseData: [],
        }
        getLearnerEducationMock.mockResolvedValue(courses)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(expected)
      })
      it('should return the expected response if there are both current and historical courses', async () => {
        const expected = {
          historicalCoursesPresent: true,
          currentCourseData: [
            {
              label: 'Instructing group cycling sessions',
              value: 'Planned end date on 1 August 2019',
            },
            {
              label: 'Ocean Science (prisoner temporarily withdrawn)',
              value: 'Planned end date on 31 December 2019',
            },
          ],
        }
        getLearnerEducationMock.mockResolvedValue(dummyEducations)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(expected)
      })
    })

    describe('Work inside prison', () => {
      const nomisId = 'G3609VL'
      it('should return null content on work history api error', async () => {
        getLearnerActivitiesHistoryMock.mockRejectedValue(new Error('error'))
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(actual.content.currentWorkData).toBeNull()
      })
      it('should return null content on Unacceptable Absences api error', async () => {
        getUnacceptableAbsencesMock.mockRejectedValue(new Error('whereabouts api error'))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(actual.content.unacceptableAbsenceSummary).toBeNull()
      })
      it('should return null content on prisoner details api error', async () => {
        getPrisonerDetailsMock.mockRejectedValue(new Error('error'))
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(actual.content.currentWorkData).toBeNull()
      })
      it('should call the endpoints with the correct prn, context and dates', async () => {
        const oneYearAgo = moment().subtract(1, 'year').format('YYYY-MM-DD')
        await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
        expect(getLearnerActivitiesHistoryMock).toHaveBeenCalledWith(credentialsRef, nomisId, oneYearAgo, {
          size: 1000,
        })
        expect(getUnacceptableAbsencesMock).toHaveBeenCalledTimes(2) // may change
      })
      it('should return expected response when the prisoner is not found', async () => {
        getLearnerActivitiesHistoryMock.mockRejectedValue(makeNotFoundError())
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(actual.content.currentWorkData).toEqual(DEFAULT_WORK_DATA)
      })
      it('should return the expected response if the user has no work', async () => {
        getLearnerActivitiesHistoryMock.mockResolvedValue({ content: [] })
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        expect(actual.content.currentWorkData).toEqual(DEFAULT_WORK_DATA)
      })
      it('should return the expected response if the user has no current work but has historical work', async () => {
        const dummyActivitiesHistoryNoCurrent = {
          content: [
            {
              bookingId: 1102484,
              agencyLocationId: 'MDI',
              agencyLocationDescription: 'Moorland (HMP & YOI)',
              description: 'Cleaner HB1 AM',
              startDate: '2021-07-20',
              endDate: '2021-07-23',
              isCurrentActivity: false,
            },
            {
              bookingId: 1102484,
              agencyLocationId: 'MDI',
              agencyLocationDescription: 'Moorland (HMP & YOI)',
              description: 'Cleaner HB1 PM',
              startDate: '2021-07-20',
              isCurrentActivity: false,
            },
          ],
        }
        getLearnerActivitiesHistoryMock.mockResolvedValue(dummyActivitiesHistoryNoCurrent)
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)

        const expected = {
          currentJobs: [],
          workHistoryPresent: true,
        }
        expect(actual.content.currentWorkData).toEqual(expected)
      })
      it('should filter out work that is not in the current caseload', async () => {
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        const expected = {
          currentJobs: [
            {
              label: 'Cleaner BB1 AM',
              value: 'Started on 19 August 2021',
            },
          ],
          workHistoryPresent: true,
        }
        expect(actual.content.currentWorkData).toEqual(expected)
      })
      it('should return the expected response if the user has current work and historical work', async () => {
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        const expected = {
          currentJobs: [
            {
              label: 'Cleaner BB1 AM',
              value: 'Started on 19 August 2021',
            },
          ],
          workHistoryPresent: true,
        }
        expect(actual.content.currentWorkData).toEqual(expected)
      })
      it('should return the expected unacceptable absences data with absences', async () => {
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(4))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        const expected = {
          acceptableAbsence: 7,
          unacceptableAbsence: 4,
          total: 42,
          noneInSixMonths: false,
        }
        expect(actual.content.unacceptableAbsenceSummary).toEqual(expected)
      })
      it('should return the expected unacceptable absences data if no such absences', async () => {
        getUnacceptableAbsencesMock.mockResolvedValue(getDummyUnacceptableAbsenceSummary(0))
        const actual = await service.getCurrentActivities(whereaboutsContext, nomisId)
        const expected = {
          acceptableAbsence: 7,
          unacceptableAbsence: 0,
          total: 42,
          noneInSixMonths: true,
        }
        expect(actual.content.unacceptableAbsenceSummary).toEqual(expected)
      })
    })

    describe('Employability Skills', () => {
      const nomisId = 'G3609VL'

      it('should return null content on error', async () => {
        getLearnerEmployabilitySkillsMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerEmployabilitySkills(nomisId)
        expect(actual.content).toBeNull()
      })

      it('should return expected response when the prisoner is not registered in Curious', async () => {
        getLearnerEmployabilitySkillsMock.mockRejectedValue(makeNotFoundError())

        const actual = await service.getLearnerEmployabilitySkills(nomisId)

        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(new Map<EmployabilitySkill, EmployabilitySkillsReview>())
      })

      it('should return the latest reviews where there are skills present', async () => {
        getLearnerEmployabilitySkillsMock.mockResolvedValue(employabilitySkillsData)
        const expected = new Map().set('skill1', latestReview1).set('skill2', latestReview2)

        const actual = await service.getLearnerEmployabilitySkills(nomisId)

        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(expected)
      })
    })

    describe('Learner neurodivergence', () => {
      const nomisId = 'G3609VL'

      it('should set enabled to true', async () => {
        const actual = await service.getNeurodivergence(nomisId)

        expect(actual.enabled).toBeTruthy()
        expect(getLearnerdivergenceMock).toHaveBeenCalledTimes(1)
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
      })
      it('should return expected response when the prisoner is not registered in Curious', async () => {
        getLearnerdivergenceMock.mockRejectedValue(makeNotFoundError())
        const actual = await service.getNeurodivergence(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual([])
      })
      it('should return expected response with appropriate message when no neurodiversity is recorded', async () => {
        const noNeurodiversity = [
          {
            prn: 'G3609VL',
            establishmentId: 'MDI',
            establishmentName: 'HMP Moorland',
            neurodivergenceSelfDeclared: [],
            selfDeclaredDate: '',
            neurodivergenceAssessed: [],
            assessmentDate: '',
            neurodivergenceSupport: [],
            supportDate: '',
          },
        ]
        getLearnerdivergenceMock.mockResolvedValue(noNeurodiversity)
        const actual = await service.getNeurodivergence(nomisId)
        expect(actual.content.neurodivergenceAssessed).toBeFalsy()
        expect(getLearnerdivergenceMock).toHaveBeenCalledTimes(1)
      })
      it('should return a null content error', async () => {
        getLearnerdivergenceMock.mockRejectedValue(new Error('error'))
        const actual = await service.getNeurodivergence(nomisId)
        expect(actual).toBeNull()
      })
      it('should return self-declared neurodiversity and support details when the prisoner is in Curious', async () => {
        const selfAssessed = [
          {
            prn: 'G3609VL',
            establishmentId: 'MDI',
            establishmentName: 'HMP Moorland',
            neurodivergenceSelfDeclared: ['ADHD', 'Autism'],
            selfDeclaredDate: '22-02-10',
            neurodivergenceSupport: ['Memory support', 'Reading'],
            supportDate: '2022-02-20',
          },
        ]
        const expected = [
          {
            divergenceAssessed: [null],
            divergenceSelfDeclared: [
              {
                details: [
                  {
                    ldd: ['ADHD', 'Autism'],
                    label: 'From self-assessment',
                  },
                  {
                    label: 'selfDeclaredDate',
                    value: '10 February 2022',
                  },
                ],
              },
            ],
            divergenceSupport: [
              {
                details: [
                  {
                    ldd: ['Memory support', 'Reading'],
                    label: 'Support needed',
                  },
                  {
                    label: 'Recorded on',
                    value: '20 February 2022',
                  },
                ],
              },
            ],
          },
        ]
        getLearnerdivergenceMock.mockResolvedValue(selfAssessed)
        const actual = await service.getNeurodivergence(nomisId)
        expect(actual.content).toStrictEqual(expected)
      })
      it('should return self-declared and assessment neurodiversity inc. support details when the prisoner is in Curious', async () => {
        const neurodiversity = [
          {
            prn: 'G3609VL',
            establishmentId: 'MDI',
            establishmentName: 'HMP Moorland',
            neurodivergenceSelfDeclared: ['ADHD', 'Autism'],
            selfDeclaredDate: '22-02-10',
            neurodivergenceAssessed: ['Acquired brain injury'],
            assessmentDate: '2022-02-15',
            neurodivergenceSupport: ['Memory support', 'Reading'],
            supportDate: '2022-02-20',
          },
        ]
        const expected = [
          {
            divergenceAssessed: [
              {
                details: [
                  {
                    ldd: ['Acquired brain injury'],
                    label: 'From neurodiversity assessment',
                  },
                  {
                    label: 'assessmentDate',
                    value: '15 February 2022',
                  },
                ],
              },
            ],
            divergenceSelfDeclared: [
              {
                details: [
                  {
                    ldd: ['ADHD', 'Autism'],
                    label: 'From self-assessment',
                  },
                  {
                    label: 'selfDeclaredDate',
                    value: '10 February 2022',
                  },
                ],
              },
            ],
            divergenceSupport: [
              {
                details: [
                  {
                    ldd: ['Memory support', 'Reading'],
                    label: 'Support needed',
                  },
                  {
                    label: 'Recorded on',
                    value: '20 February 2022',
                  },
                ],
              },
            ],
          },
        ]
        getLearnerdivergenceMock.mockResolvedValue(neurodiversity)
        const actual = await service.getNeurodivergence(nomisId)
        expect(actual.content).toStrictEqual(expected)
      })
    })
  })
})

function getDummyPrisonerDetails() {
  return [
    {
      offenderNo: 'G6123VU',
      firstName: 'JOHN',
      lastName: 'SAUNDERS',
      dateOfBirth: '1990-10-12',
      gender: 'Male',
      sexCode: 'M',
      nationalities: 'multiple nationalities field',
      currentlyInPrison: 'Y',
      latestBookingId: 1102484,
      latestLocationId: 'MDI',
      latestLocation: 'Moorland (HMP & YOI)',
      internalLocation: 'MDI-3-2-026',
      pncNumber: '08/359381C',
      croNumber: '400862/08W',
      ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
      ethnicityCode: 'W1',
      birthCountry: 'England',
      religion: 'Celestial Church of God',
      religionCode: 'CCOG',
      convictedStatus: 'Convicted',
      legalStatus: 'RECALL',
      imprisonmentStatus: 'CUR_ORA',
      imprisonmentStatusDesc: 'ORA Recalled from Curfew Conditions',
      receptionDate: '2016-05-30',
      maritalStatus: 'No',
    },
  ]
}

function getDummyUnacceptableAbsenceSummary(unacceptableAbsence) {
  return {
    acceptableAbsence: 7,
    unacceptableAbsence,
    total: 42,
  }
}

function getDummyLearnerProfiles(): LearnerProfile[] {
  return [
    {
      prn: 'G6123VU',
      establishmentId: 'NHA',
      establishmentName: 'HMP New Hall',
      uln: '9876987654',
      lddHealthProblem: null,
      priorAttainment: null,
      qualifications: [
        {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: AssessmentQualificationType.Maths,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: AssessmentQualificationType.DigitalLiteracy,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
      ],
      languageStatus: 'English',
      plannedHours: null,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLDDAndHealthProblem: 'Dyslexia',
      additionalLDDAndHealthProblems: ['Hearing impairment', 'Social and emotional difficulties', 'Autism'],
    },
    {
      prn: 'G6123VU',
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      uln: '1234123412',
      lddHealthProblem:
        'Learner considers himself or herself to have a learning difficulty and/or disability and/or health problem.',
      priorAttainment: 'Full level 3',
      qualifications: [
        {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'Level 1',
          assessmentDate: '2021-05-13',
        },
        {
          qualificationType: AssessmentQualificationType.Maths,
          qualificationGrade: 'Level 1',
          assessmentDate: '2021-05-20',
        },
        {
          qualificationType: AssessmentQualificationType.DigitalLiteracy,
          qualificationGrade: 'Level 2',
          assessmentDate: '2021-05-19',
        },
      ],
      languageStatus: 'English',
      plannedHours: 200,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLDDAndHealthProblem: 'Visual impairment',
      additionalLDDAndHealthProblems: [
        'Hearing impairment',
        'Social and emotional difficulties',
        'Mental health difficulty',
      ],
    },
    {
      prn: 'G6123VU',
      establishmentId: 'WAK',
      establishmentName: 'HMP Wakefield',
      uln: '9876987654',
      lddHealthProblem: null,
      priorAttainment: null,
      qualifications: [
        {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: AssessmentQualificationType.Maths,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: AssessmentQualificationType.DigitalLiteracy,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
      ],
      languageStatus: 'English',
      plannedHours: null,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLDDAndHealthProblem: null,
      additionalLDDAndHealthProblems: [],
    },
  ]
}

function getDummyGoals(): LearnerGoals {
  return {
    prn: 'G3609VL',
    employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
    personalGoals: ['To support my family', 'To be healthy'],
    longTermGoals: ['I would like to own my own flat', 'I would like a full time job'],
    shortTermGoals: ['I would like to improve my English skills'],
  }
}

function getdummyActivitiesHistory(): eswe.WorkHistory {
  return {
    content: [
      {
        bookingId: 1102484,
        agencyLocationId: 'MDI',
        agencyLocationDescription: 'Moorland (HMP & YOI)',
        description: 'Cleaner BB1 AM',
        startDate: '2021-08-19',
        isCurrentActivity: true,
      },
      {
        bookingId: 1102484,
        agencyLocationId: 'MDI',
        agencyLocationDescription: 'Wayland (HMP)',
        description: 'Library AM',
        startDate: '2020-06-18',
        isCurrentActivity: true,
      },
      {
        bookingId: 1102484,
        agencyLocationId: 'MDI',
        agencyLocationDescription: 'Moorland (HMP & YOI)',
        description: 'Cleaner HB1 AM',
        startDate: '2021-07-20',
        endDate: '2021-07-23',
        isCurrentActivity: false,
      },
      {
        bookingId: 1102484,
        agencyLocationId: 'MDI',
        agencyLocationDescription: 'Moorland (HMP & YOI)',
        description: 'Library HB1 AM',
        startDate: '2019-07-20',
        endDate: '2021-07-22',
        isCurrentActivity: false,
        endReasonDescription: 'Unacceptable behaviour',
        endCommentText: 'John has been throwing bricks at teacher',
      },
      {
        bookingId: 1102484,
        agencyLocationId: 'MDI',
        agencyLocationDescription: 'Moorland (HMP & YOI)',
        description: 'Cleaner HB1 PM',
        startDate: '2021-07-20',
        endDate: '2021-05-11',
        isCurrentActivity: false,
      },
    ],
    pageable: {
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
      offset: 0,
      pageSize: 20,
      pageNumber: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalElements: 5,
    totalPages: 1,
    size: 5,
    number: 5,
    sort: {
      empty: true,
      sorted: false,
      unsorted: true,
    },
    first: true,
    numberOfElements: 5,
    empty: false,
  }
}

function getDummyEducations(): PageLearnerEducation {
  return {
    content: [
      {
        prn: 'A1234AA',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        courseName: 'Foundation Degree in Arts in Equestrian Practice and Technology',
        courseCode: '300082',
        isAccredited: true,
        aimSequenceNumber: null,
        learningStartDate: '2021-07-19',
        learningPlannedEndDate: '2022-06-16',
        learningActualEndDate: '2021-07-21',
        learnersAimType: 'Programme aim',
        miNotionalNVQLevelV2: 'Level 5',
        sectorSubjectAreaTier1: 'Agriculture, Horticulture and Animal Care',
        sectorSubjectAreaTier2: 'Animal Care and Veterinary Science',
        occupationalIndicator: false,
        accessHEIndicator: false,
        keySkillsIndicator: false,
        functionalSkillsIndicator: false,
        gceIndicator: false,
        gcsIndicator: false,
        asLevelIndicator: false,
        a2LevelIndicator: false,
        qcfIndicator: false,
        qcfDiplomaIndicator: false,
        qcfCertificateIndicator: false,
        lrsGLH: 0,
        attendedGLH: null,
        actualGLH: 200,
        outcome: 'No achievement',
        outcomeGrade: 'Fail',
        employmentOutcome: null,
        withdrawalReasons: null,
        prisonWithdrawalReason: null,
        completionStatus: 'The learner has completed the learning activities leading to the learning aim',
        withdrawalReasonAgreed: false,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'DN7 6BW',
        unitType: 'QUALIFICATION',
        fundingType: 'DPS',
        deliveryMethodType: null,
        alevelIndicator: false,
      },
      {
        prn: 'A1234AA',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        courseName: 'Certificate of Management',
        courseCode: '101448',
        isAccredited: true,
        aimSequenceNumber: 1,
        learningStartDate: '2021-07-01',
        learningPlannedEndDate: '2021-07-31',
        learningActualEndDate: '2021-07-08',
        learnersAimType: 'Component learning aim within a programme',
        miNotionalNVQLevelV2: 'Level 4',
        sectorSubjectAreaTier1: 'Business, Administration and Law',
        sectorSubjectAreaTier2: 'Business Management',
        occupationalIndicator: false,
        accessHEIndicator: false,
        keySkillsIndicator: false,
        functionalSkillsIndicator: false,
        gceIndicator: false,
        gcsIndicator: false,
        asLevelIndicator: false,
        a2LevelIndicator: false,
        qcfIndicator: false,
        qcfDiplomaIndicator: false,
        qcfCertificateIndicator: false,
        lrsGLH: 0,
        attendedGLH: 5678,
        actualGLH: 1234,
        outcome: 'Achieved',
        outcomeGrade: null,
        employmentOutcome: null,
        withdrawalReasons: 'Other',
        prisonWithdrawalReason: 'Changes in their risk profile meaning they can no longer take part in the learning',
        completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
        withdrawalReasonAgreed: true,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'DN7 6BW',
        unitType: 'QUALIFICATION',
        fundingType: 'DPS',
        deliveryMethodType: null,
        alevelIndicator: false,
      },
      {
        prn: 'A1234AA',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        courseName: 'Human Science',
        courseCode: '008HUM001',
        isAccredited: false,
        aimSequenceNumber: 2,
        learningStartDate: '2020-09-01',
        learningPlannedEndDate: '2020-12-19',
        learningActualEndDate: '2020-12-02',
        learnersAimType: null,
        miNotionalNVQLevelV2: null,
        sectorSubjectAreaTier1: null,
        sectorSubjectAreaTier2: null,
        occupationalIndicator: null,
        accessHEIndicator: null,
        keySkillsIndicator: null,
        functionalSkillsIndicator: null,
        gceIndicator: null,
        gcsIndicator: null,
        asLevelIndicator: null,
        a2LevelIndicator: null,
        qcfIndicator: null,
        qcfDiplomaIndicator: null,
        qcfCertificateIndicator: null,
        lrsGLH: null,
        attendedGLH: null,
        actualGLH: 100,
        outcome: 'Achieved',
        outcomeGrade: 'Pass',
        employmentOutcome: null,
        withdrawalReasons: null,
        prisonWithdrawalReason: null,
        completionStatus: 'The learner has completed the learning activities leading to the learning aim',
        withdrawalReasonAgreed: false,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'DN7 6BW',
        unitType: null,
        fundingType: 'DPS',
        deliveryMethodType: LearnerEducationDeliveryMethodType.BlendedLearning,
        alevelIndicator: null,
      },
      {
        prn: 'A1234AA',
        establishmentId: 'BRI',
        establishmentName: 'HMP Bristol',
        courseName: 'Ocean Science',
        courseCode: '004TES006',
        isAccredited: false,
        aimSequenceNumber: 1,
        learningStartDate: '2019-12-15',
        learningPlannedEndDate: '2019-12-31',
        learningActualEndDate: '2020-03-31',
        learnersAimType: null,
        miNotionalNVQLevelV2: null,
        sectorSubjectAreaTier1: null,
        sectorSubjectAreaTier2: null,
        occupationalIndicator: null,
        accessHEIndicator: null,
        keySkillsIndicator: null,
        functionalSkillsIndicator: null,
        gceIndicator: null,
        gcsIndicator: null,
        asLevelIndicator: null,
        a2LevelIndicator: null,
        qcfIndicator: null,
        qcfDiplomaIndicator: null,
        qcfCertificateIndicator: null,
        lrsGLH: null,
        attendedGLH: 4356,
        actualGLH: 5250,
        outcome: null,
        outcomeGrade: null,
        employmentOutcome: null,
        withdrawalReasons: 'Other',
        prisonWithdrawalReason: 'Significant ill health causing them to be unable to attend education',
        completionStatus: 'Learner has temporarily withdrawn from the aim due to an agreed break in learning',
        withdrawalReasonAgreed: true,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'BS7 8PS',
        unitType: null,
        fundingType: 'PEF',
        deliveryMethodType: null,
        alevelIndicator: null,
      },
      {
        prn: 'A1234AA',
        establishmentId: 'DAR',
        establishmentName: 'HMP Dartmoor',
        courseName: 'Foundation Degree in Cricket Coaching - (Myerscough College)',
        courseCode: '301409',
        isAccredited: true,
        aimSequenceNumber: null,
        learningStartDate: '2019-10-01',
        learningPlannedEndDate: '2019-10-02',
        learningActualEndDate: '2019-10-02',
        learnersAimType: 'Component learning aim within a programme',
        miNotionalNVQLevelV2: 'Level 5',
        sectorSubjectAreaTier1: 'Leisure, Travel and Tourism',
        sectorSubjectAreaTier2: 'Sport, Leisure and Recreation',
        occupationalIndicator: false,
        accessHEIndicator: false,
        keySkillsIndicator: false,
        functionalSkillsIndicator: false,
        gceIndicator: false,
        gcsIndicator: false,
        asLevelIndicator: false,
        a2LevelIndicator: false,
        qcfIndicator: false,
        qcfDiplomaIndicator: false,
        qcfCertificateIndicator: false,
        lrsGLH: 0,
        attendedGLH: 13,
        actualGLH: 56,
        outcome: null,
        outcomeGrade: null,
        employmentOutcome: null,
        withdrawalReasons: 'Other',
        prisonWithdrawalReason: 'Changes in their risk profile meaning they can no longer take part in the learning',
        completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
        withdrawalReasonAgreed: true,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'PL20 6RR',
        unitType: 'QUALIFICATION',
        fundingType: 'DPS',
        deliveryMethodType: null,
        alevelIndicator: false,
      },
      {
        prn: 'A1234AA',
        establishmentId: 'LEY',
        establishmentName: 'HMP Leyhill',
        courseName: 'Instructing group cycling sessions',
        courseCode: 'Y6174024',
        isAccredited: true,
        aimSequenceNumber: 1,
        learningStartDate: '2019-08-01',
        learningPlannedEndDate: '2019-08-01',
        learningActualEndDate: null,
        learnersAimType: 'Component learning aim within a programme',
        miNotionalNVQLevelV2: 'Level 2',
        sectorSubjectAreaTier1: 'Leisure, Travel and Tourism',
        sectorSubjectAreaTier2: 'Sport, Leisure and Recreation',
        occupationalIndicator: false,
        accessHEIndicator: false,
        keySkillsIndicator: false,
        functionalSkillsIndicator: false,
        gceIndicator: false,
        gcsIndicator: false,
        asLevelIndicator: false,
        a2LevelIndicator: false,
        qcfIndicator: true,
        qcfDiplomaIndicator: false,
        qcfCertificateIndicator: false,
        lrsGLH: 21,
        attendedGLH: null,
        actualGLH: 7634,
        outcome: null,
        outcomeGrade: null,
        employmentOutcome: null,
        withdrawalReasons: null,
        prisonWithdrawalReason: null,
        completionStatus:
          'The learner is continuing or intending to continue the learning activities leading to the learning aim',
        withdrawalReasonAgreed: false,
        fundingModel: 'Adult skills',
        fundingAdjustmentPriorLearning: null,
        subcontractedPartnershipUKPRN: null,
        deliveryLocationPostCode: 'CF1 1BH',
        unitType: 'UNIT',
        fundingType: 'DPS',
        deliveryMethodType: null,
        alevelIndicator: false,
      },
    ],
    number: 0,
    size: 10,
    totalElements: 6,
    first: true,
    last: true,
    numberOfElements: 6,
    totalPages: 1,
    pageable: {
      pageSize: 10,
      pageNumber: 0,
      offset: 0,
      unpaged: false,
      paged: true,
    },
    empty: false,
  }
}

function getDummyLearnerDivergence(): LearnerNeurodivergence[] {
  return [
    {
      prn: 'G3609VL',
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      neurodivergenceSelfDeclared: ['ADHD', 'Autism'],
      selfDeclaredDate: '22-02-10',
      neurodivergenceAssessed: ['Acquired brain injury'],
      assessmentDate: '2022-02-15',
      neurodivergenceSupport: ['Memory support', 'Reading'],
      supportDate: '2022-02-20',
    },
  ]
}

const latestReview1 = {
  reviewDate: '2021-05-30',
  currentProgression: '2',
  comment: 'test 2',
}
const latestReview2 = {
  reviewDate: '2021-06-30',
  currentProgression: '2',
  comment: 'test 2',
}
const review1 = {
  reviewDate: '2021-05-29',
  currentProgression: '2',
  comment: 'test 1',
}
const review2 = {
  reviewDate: '2021-06-29',
  currentProgression: '2',
  comment: 'test 1',
}
const review3 = {
  reviewDate: '2021-05-28',
  currentProgression: '2',
  comment: 'test 1',
}
const employabilitySkillsData = {
  content: [
    {
      employabilitySkill: 'skill1',
      reviews: [review1],
    },
    {
      employabilitySkill: 'skill2',
      reviews: [latestReview2, review2],
    },
    {
      employabilitySkill: 'skill1',
      reviews: [review3, latestReview1],
    },
    {
      employabilitySkill: 'skill3',
      reviews: [],
    },
    {
      employabilitySkill: 'skill4',
    },
  ],
}
