import nock from 'nock'
import CuriousApi, { dummyLearnerLatestAssessments } from './curiousApi'
import clientFactory from '../oauthEnabledClient'

const hostname = 'http://localhost:8080'

const client = clientFactory({ baseUrl: `${hostname}` })
const curiousApi = CuriousApi.create(client)
const mock = nock(hostname)
const accessToken = 'test_access_token'

describe('curiousApi', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('getLearnerProfiles', () => {
    const dummyLearnerProfiles = getDummyLearnerProfiles()
    it('should return the expected response data', async () => {
      const nomisId = dummyLearnerProfiles[0].prn
      mock
        .get(`/learnerProfile/${nomisId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, dummyLearnerProfiles)

      const actual = await curiousApi.getLearnerProfiles({ access_token: accessToken }, nomisId)
      expect(actual).toEqual(dummyLearnerProfiles)
    })

    it('should return the expected response data with establishmentid in query', async () => {
      const nomisId = dummyLearnerProfiles[0].prn
      const { establishmentId } = dummyLearnerProfiles[0]
      mock
        .get(`/learnerProfile/${nomisId}?establishmentId=${establishmentId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, [dummyLearnerProfiles[0]])

      const actual = await curiousApi.getLearnerProfiles({ access_token: accessToken }, nomisId, establishmentId)
      expect(actual).toContainEqual(dummyLearnerProfiles[0])
    })
  })

  describe('getLearnerEducation', () => {
    const dummyEducations = getDummyEducations()
    it('should return the expected response data', async () => {
      const nomisId = dummyEducations[0].prn
      mock
        .get(`/learnerEducation/${nomisId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, dummyEducations)

      const actual = await curiousApi.getLearnerEducation({ access_token: accessToken }, nomisId)
      expect(actual).toEqual(dummyEducations)
    })
  })

  describe('getLearnerLatestAssessments', () => {
    it('should return the expected response data', async () => {
      const actual = await curiousApi.getLearnerLatestAssessments('abc')
      expect(actual).toEqual(dummyLearnerLatestAssessments)
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
      establishmentId: 2,
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
      establishmentId: 1,
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
  ]
}
