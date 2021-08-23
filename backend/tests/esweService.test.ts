import EsweService, { DEFAULT_SKILL_LEVELS, DEFAULT_GOALS, DEFAULT_COURSE_DATA } from '../services/esweService'
import { app } from '../config'
import CuriousApi from '../api/curious/curiousApi'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

describe('Education skills and work experience', () => {
  const dummyLearnerProfiles = getDummyLearnerProfiles()
  const dummyEducations = getDummyEducations()
  const dummyGoals = getDummyGoals()
  const credentialsRef = {}
  const curiousApi = {} as CuriousApi
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  let service
  let getLearnerProfilesMock
  let getLearnerEducationMock
  let getLearnerLatestAssessmentsMock
  let getLearnerGoalsMock
  beforeEach(() => {
    getLearnerProfilesMock = jest.fn()
    getLearnerEducationMock = jest.fn()
    getLearnerLatestAssessmentsMock = jest.fn()
    getLearnerGoalsMock = jest.fn()
    curiousApi.getLearnerProfiles = getLearnerProfilesMock
    curiousApi.getLearnerEducation = getLearnerEducationMock
    curiousApi.getLearnerLatestAssessments = getLearnerLatestAssessmentsMock
    curiousApi.getLearnerGoals = getLearnerGoalsMock
    systemOauthClient.getClientCredentialsTokens.mockReset()

    getLearnerProfilesMock.mockResolvedValue(dummyLearnerProfiles)
    getLearnerEducationMock.mockResolvedValue(dummyEducations)
    getLearnerGoalsMock.mockResolvedValue(dummyGoals)

    systemOauthClient.getClientCredentialsTokens.mockReturnValue(credentialsRef)
    service = EsweService.create(curiousApi, systemOauthClient)
  })

  describe('learner profiles', () => {
    const nomisId = 'G2823GV'

    it('should return expected learner profiles', async () => {
      const actual = await service.getLearnerProfiles(nomisId)
      expect(actual.enabled).toBeFalsy()
      expect(actual.content).toHaveLength(0)
      expect(getLearnerProfilesMock).not.toHaveBeenCalled()
      expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
    })

    it('should set enabled to true', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual(dummyLearnerProfiles)
      expect(getLearnerProfilesMock).toHaveBeenCalledTimes(1)
      expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
      expect(getLearnerProfilesMock).toHaveBeenCalledWith(credentialsRef, nomisId)
    })

    it('should return null content', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      getLearnerProfilesMock.mockRejectedValue(new Error('error'))

      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.content).toBeNull()
    })
  })

  describe('Learning difficulties', () => {
    const nomisId = 'G8930UW'

    it('should return null content when feature flag is disabled', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
      const actual = await service.getLearningDifficulties(nomisId)
      expect(actual.enabled).toBeFalsy()
      expect(actual.content).toBeNull()
      expect(getLearnerProfilesMock).not.toHaveBeenCalled()
      expect(getLearnerEducationMock).not.toHaveBeenCalled()
      expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
    })

    it('should return null content on error', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
      getLearnerProfilesMock.mockRejectedValue(new Error('error'))
      const actual = await service.getLearningDifficulties(nomisId)
      expect(actual.content).toBeNull()
    })

    it('should return expected response when the prisoner is not registered in Curious', async () => {
      const error = {
        status: 404,
      }
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
      getLearnerProfilesMock.mockRejectedValue(error)
      const actual = await service.getLearningDifficulties(nomisId)
      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toEqual([])
    })
    it('should return expected response when the prisoner is in Curious but has listed no LDD information', async () => {
      const noLDD = [
        {
          prn: 'G3609VL',
          establishmentName: 'HMP New Hall',
          primaryLLDDAndHealthProblem: null,
          additionalLLDDAndHealthProblems: [],
        },
      ]
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
      getLearnerProfilesMock.mockResolvedValue(noLDD)
      const actual = await service.getLearningDifficulties(nomisId)
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
          primaryLLDDAndHealthProblem: 'Visual impairment',
          additionalLLDDAndHealthProblems: [
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
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Hearing impairment</p><p class='govuk-body'>Mental health difficulty</p><p class='govuk-body'>Social and emotional difficulties</p>",
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
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
      getLearnerProfilesMock.mockResolvedValue(oneCaseloadLDD)
      const actual = await service.getLearningDifficulties(nomisId)
      expect(actual.content).toStrictEqual(expected)
    })
    it('should order the LDD information alphabetically by establishment name if there is data from multiple caseloads, and ignore caseloads where there are no LDD listed', async () => {
      const expected = [
        {
          details: [
            {
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Hearing impairment</p><p class='govuk-body'>Mental health difficulty</p><p class='govuk-body'>Social and emotional difficulties</p>",
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
              html: "<p class='govuk-body'>Dyslexia</p><p class='govuk-body'>Autism</p><p class='govuk-body'>Hearing impairment</p><p class='govuk-body'>Social and emotional difficulties</p>",
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
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
      getLearnerProfilesMock.mockResolvedValue(dummyLearnerProfiles)
      const actual = await service.getLearningDifficulties(nomisId)
      expect(actual.content).toStrictEqual(expected)
    })
  })

  describe('Work and skills tab', () => {
    describe('Functional skills level', () => {
      const nomisId = 'G2823GV'

      it('should return expected response when there is one assessment of each skill available', async () => {
        const dummyFunctionalSkillsLevels = {
          prn: 'G8346GA',
          qualifications: [
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-05-02',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-06-01',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-05-27',
              },
            },
          ],
        }

        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
              establishmentId: 8,
              establishmentName: 'HMP Moorland',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-07-01',
              },
            },
            {
              establishmentId: 8,
              establishmentName: 'HMP Moorland',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-07-01',
              },
            },
          ],
        }

        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockResolvedValue([])

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(DEFAULT_SKILL_LEVELS)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      })

      it('should return expected response when the prisoner is not registered in Curious', async () => {
        const error = {
          status: 404,
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockRejectedValue(error)
        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(DEFAULT_SKILL_LEVELS)
      })
      it('should return null content on error', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.content).toBeNull()
      })
    })
    describe('Goals', () => {
      const nomisId = 'G3609VL'
      it('should return null when feature flag is disabled', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeFalsy()
        expect(actual.content).toBeNull()
        expect(getLearnerGoalsMock).not.toHaveBeenCalled()
        expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
      })
      it('should return null content on error', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerGoalsMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.content).toBeNull()
      })
      it('should return expected response when the prisoner is not registered in Curious', async () => {
        const error = {
          status: 404,
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerGoalsMock.mockRejectedValue(error)
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
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerGoalsMock.mockResolvedValue(emptyResponse)
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(DEFAULT_GOALS)
      })
      it('should return the expected response if there are goals available for both goal types', async () => {
        const expected = {
          employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
          personalGoals: ['To support my family', 'To be healthy'],
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        const actual = await service.getLearnerGoals(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toEqual(expected)
      })
      it('should return the expected response if there are goals available for just one goal type', async () => {
        const expected = {
          employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
          personalGoals: ['Not entered'],
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
      it('should return null when feature flag is disabled', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.enabled).toBeFalsy()
        expect(actual.content).toBeNull()
        expect(getLearnerEducationMock).not.toHaveBeenCalled()
        expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
      })
      it('should return null content on error', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerEducationMock.mockRejectedValue(new Error('error'))
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toBeNull()
      })
      it('should return expected response when the prisoner is not registered in Curious', async () => {
        const error = {
          status: 404,
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerEducationMock.mockRejectedValue(error)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(DEFAULT_COURSE_DATA)
      })
      it('should return the expected response if the user has no courses', async () => {
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
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
              label: 'Ocean Science',
              value: 'Planned end date on 31 December 2019',
            },
          ],
        }
        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerEducationMock.mockResolvedValue(dummyEducations)
        const actual = await service.getLearnerEducation(nomisId)
        expect(actual.content).toEqual(expected)
      })
    })
  })
})

function getDummyLearnerProfiles(): curious.LearnerProfile[] {
  return [
    {
      prn: 'G6123VU',
      establishmentId: 12,
      establishmentName: 'HMP New Hall',
      uln: '9876987654',
      lddHealthProblem: null,
      priorAttainment: null,
      qualifications: [
        {
          qualificationType: 'English',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: 'Maths',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: 'Digital Literacy',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
      ],
      languageStatus: 'English',
      plannedHours: null,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLLDDAndHealthProblem: 'Dyslexia',
      additionalLLDDAndHealthProblems: ['Hearing impairment', 'Social and emotional difficulties', 'Autism'],
    },
    {
      prn: 'G6123VU',
      establishmentId: 8,
      establishmentName: 'HMP Moorland',
      uln: '1234123412',
      lddHealthProblem:
        'Learner considers himself or herself to have a learning difficulty and/or disability and/or health problem.',
      priorAttainment: 'Full level 3',
      qualifications: [
        {
          qualificationType: 'English',
          qualificationGrade: 'Level 1',
          assessmentDate: '2021-05-13',
        },
        {
          qualificationType: 'Maths',
          qualificationGrade: 'Level 1',
          assessmentDate: '2021-05-20',
        },
        {
          qualificationType: 'Digital Literacy',
          qualificationGrade: 'Level 2',
          assessmentDate: '2021-05-19',
        },
      ],
      languageStatus: 'English',
      plannedHours: 200,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLLDDAndHealthProblem: 'Visual impairment',
      additionalLLDDAndHealthProblems: [
        'Hearing impairment',
        'Social and emotional difficulties',
        'Mental health difficulty',
      ],
    },
    {
      prn: 'G6123VU',
      establishmentId: 76,
      establishmentName: 'HMP Wakefield',
      uln: '9876987654',
      lddHealthProblem: null,
      priorAttainment: null,
      qualifications: [
        {
          qualificationType: 'English',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: 'Maths',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
        {
          qualificationType: 'Digital Literacy',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        },
      ],
      languageStatus: 'English',
      plannedHours: null,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLLDDAndHealthProblem: null,
      additionalLLDDAndHealthProblems: [],
    },
  ]
}

function getDummyGoals(): curious.LearnerGoals {
  return {
    prn: 'G3609VL',
    employmentGoals: ['To be an electrician', 'To get an electrics qualification'],
    personalGoals: ['To support my family', 'To be healthy'],
    longTermGoals: ['To be rich'],
    shortTermGoals: ['Earn money'],
  }
}

function getDummyEducations(): curious.LearnerEducation {
  return {
    content: [
      {
        prn: 'A1234AA',
        establishmentId: 8,
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
        establishmentId: 8,
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
        establishmentId: 8,
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
        deliveryMethodType: 'Face to Face Assessment',
        alevelIndicator: null,
      },
      {
        prn: 'A1234AA',
        establishmentId: 4,
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
        establishmentId: 17,
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
        establishmentId: 7,
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
    hasContent: true,
    numberOfElements: 6,
    totalPages: 1,
    pageable: {
      sort: [],
      pageSize: 10,
      pageNumber: 0,
      offset: 0,
      unpaged: false,
      paged: true,
    },
    empty: false,
  }
}
