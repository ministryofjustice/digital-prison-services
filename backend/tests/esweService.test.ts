import EsweService, { DEFAULT_SKILL_LEVELS, DEFAULT_GOALS } from '../services/esweService'
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

  describe('latest learning difficulty', () => {
    const nomisId = 'G2823GV'

    it('should return null content when feature flag is disabled', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
      const actual = await service.getLatestLearningDifficulty(nomisId)
      expect(actual.enabled).toBeFalsy()
      expect(actual.content).toBeNull()
      expect(getLearnerProfilesMock).not.toHaveBeenCalled()
      expect(getLearnerEducationMock).not.toHaveBeenCalled()
      expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
    })

    it('should set enabled to true and return content', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      const actual = await service.getLatestLearningDifficulty(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toBe('Dyslexia')
      expect(getLearnerProfilesMock).toHaveBeenCalledTimes(1)
      expect(getLearnerEducationMock).toHaveBeenCalledTimes(1)
      expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
      expect(getLearnerProfilesMock).toHaveBeenCalledWith(credentialsRef, nomisId)
      expect(getLearnerEducationMock).toHaveBeenCalledWith(credentialsRef, nomisId)
    })

    it('should return null content on error', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      getLearnerEducationMock.mockRejectedValue(new Error('error'))

      const actual = await service.getLatestLearningDifficulty(nomisId)

      expect(actual.content).toBeNull()
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
        getLearnerEducationMock.mockRejectedValue(error)
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
  })
})

function getDummyLearnerProfiles(): curious.LearnerProfile[] {
  return [
    {
      prn: 'G8346GA',
      establishmentId: 2,
      establishmentName: 'HMP Winchester',
      uln: '345455',
      lddHealthProblem: 'Dyslexia',
      priorAttainment: '',
      qualifications: [
        {
          qualificationType: 'English',
          qualificationGrade: 'c',
          assessmentDate: '2021-06-22',
        },
      ],
      languageStatus: 'string',
      plannedHours: 8,
    },
    {
      prn: 'G8346GA',
      establishmentId: 3,
      establishmentName: 'HMP Winchester',
      uln: '345455',
      lddHealthProblem: 'Autistic spectrum disorder',
      priorAttainment: '',
      qualifications: [
        {
          qualificationType: 'Maths',
          qualificationGrade: 'A',
          assessmentDate: '2021-06-22',
        },
      ],
      languageStatus: 'string',
      plannedHours: 8,
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

function getDummyEducations(): curious.LearnerEducation[] {
  return [
    {
      prn: 'G8346GA',
      establishmentId: 3,
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
    {
      prn: 'G8346GA',
      establishmentId: 2,
      establishmentName: 'HMP Bristol',
      courseName: 'testAmar',
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
      deliveryMethodType: 'Classroom Only Learning',
      alevelIndicator: null,
    },
  ]
}
