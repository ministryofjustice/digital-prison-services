import EsweService from '../services/esweService'
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
  const credentialsRef = {}
  const curiousApi = {} as CuriousApi
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  let service
  let getLearnerProfilesMock
  let getLearnerEducationMock
  beforeEach(() => {
    getLearnerProfilesMock = jest.fn()
    getLearnerEducationMock = jest.fn()
    curiousApi.getLearnerProfiles = getLearnerProfilesMock
    curiousApi.getLearnerEducation = getLearnerEducationMock

    systemOauthClient.getClientCredentialsTokens.mockReset()

    getLearnerProfilesMock.mockResolvedValue(dummyLearnerProfiles)
    getLearnerEducationMock.mockResolvedValue(dummyEducations)

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
  ]
}
