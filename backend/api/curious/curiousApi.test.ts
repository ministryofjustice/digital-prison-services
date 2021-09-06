import nock from 'nock'
import CuriousApi from './curiousApi'
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
      const nomisId = dummyEducations.content[0].prn
      mock
        .get(`/learnerEducation/${nomisId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, dummyEducations)

      const actual = await curiousApi.getLearnerEducation({ access_token: accessToken }, nomisId)
      expect(actual).toEqual(dummyEducations)
    })
  })

  describe('getLearnerLatestAssessments', () => {
    const dummyLearnerLatestAssessments = getDummyLearnerLatestAssessments()
    it('should return the expected response data', async () => {
      const nomisId = dummyLearnerLatestAssessments[0].prn
      mock
        .get(`/latestLearnerAssessments/${nomisId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, dummyLearnerLatestAssessments)
      const actual = await curiousApi.getLearnerLatestAssessments({ access_token: accessToken }, nomisId)
      expect(actual).toEqual(dummyLearnerLatestAssessments)
    })
  })

  describe('getLearnerGoals', () => {
    const dummyLearnerGoals = getDummyLearnerGoals()
    it('should return the expected response data', async () => {
      const nomisId = dummyLearnerGoals.prn
      mock
        .get(`/learnerGoals/${nomisId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, dummyLearnerGoals)
      const actual = await curiousApi.getLearnerGoals({ access_token: accessToken }, nomisId)
      expect(actual).toEqual(dummyLearnerGoals)
    })
  })
})

function getDummyLearnerProfiles(): curious.LearnerProfile[] {
  return [
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
      primaryLDDAndHealthProblem: 'Visual impairment',
      additionalLDDAndHealthProblems: [
        'Hearing impairment',
        'Social and emotional difficulties',
        'Mental health difficulty',
      ],
    },
    {
      prn: 'G6123VU',
      establishmentId: 'QWER',
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
      primaryLDDAndHealthProblem: null,
      additionalLDDAndHealthProblems: [],
    },
  ]
}

function getDummyEducations(): curious.LearnerEducation {
  return {
    content: [
      {
        prn: 'G8346GA',
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
      {
        prn: 'G8346GA',
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
    ],
  }
}

function getDummyLearnerLatestAssessments(): curious.LearnerLatestAssessment[] {
  return [
    {
      prn: 'G8346GA',
      qualifications: [
        {
          establishmentId: 'WIN',
          establishmentName: 'HMP Winchester',
          qualification: {
            qualificationType: 'English',
            qualificationGrade: 'Entry Level 2',
            assessmentDate: '2021-05-02',
          },
        },
        {
          establishmentId: 'WIN',
          establishmentName: 'HMP Winchester',
          qualification: {
            qualificationType: 'English',
            qualificationGrade: 'Entry Level 2',
            assessmentDate: '2020-12-02',
          },
        },
        {
          establishmentId: 'WIN',
          establishmentName: 'HMP Winchester',
          qualification: {
            qualificationType: 'Digital Literacy',
            qualificationGrade: 'Entry Level 1',
            assessmentDate: '2020-06-01',
          },
        },
        {
          establishmentId: 'WIN',
          establishmentName: 'HMP Winchester',
          qualification: {
            qualificationType: 'Digital Literacy',
            qualificationGrade: 'Entry Level 2',
            assessmentDate: '2021-06-01',
          },
        },
        {
          establishmentId: 'WIN',
          establishmentName: 'HMP Winchester',
          qualification: {
            qualificationType: 'Maths',
            qualificationGrade: 'Entry Level 2',
            assessmentDate: '2021-06-06',
          },
        },
      ],
    },
  ]
}

function getDummyLearnerGoals(): curious.LearnerGoals {
  return {
    prn: 'G6415GD',
    employmentGoals: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo id leo pharetra fermentum. Se',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo id leo pharetra fermentum. Se',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo id leo pharetra fermentum. Se',
    ],
    personalGoals: [
      'Sed viverra finibus tellus, commodo dapibus mauris. Phasellus porta odio in dui mattis, et sollicitu',
      'Sed viverra finibus tellus, commodo dapibus mauris. Phasellus porta odio in dui mattis, et sollicitu',
      'Sed viverra finibus tellus, commodo dapibus mauris. Phasellus porta odio in dui mattis, et sollicitu',
    ],
    longTermGoals: ['To be rich'],
    shortTermGoals: ['Earn money'],
  }
}
