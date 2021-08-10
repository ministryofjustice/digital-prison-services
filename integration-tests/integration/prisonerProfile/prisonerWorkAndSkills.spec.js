const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { clickIfExist } = require('../../test-helpers')

context('Prisoner Work and Skills', () => {
  const offenderNo = 'G6123VU'

  const visitWorkAndSkillsAndExpandAccordions = () => {
    cy.visit(`/prisoner/${offenderNo}/work-and-skills`)
    clickIfExist('.govuk-accordion__open-all[aria-expanded="false"]')
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubPathFinderOffenderDetails', null)
    cy.task('stubClientCredentialsRequest')
  })

  context('When there is no data because of an api call failure', () => {
    const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubLatestLearnerAssessments500Error', {})
      cy.task('stubLearnerEducation500Error', {})
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should show correct error message', () => {
        cy.get('[data-test="learner-latest-assessments-errorMessage"]').should('have.text', apiErrorText)
      })
    })

    context('learning history section', () => {
      it('should show correct error message', () => {
        cy.get('[data-test="learner-history-errorMessage"]').should('have.text', apiErrorText)
      })
    })
  })

  context('When the prisoner is not in Curious', () => {
    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubLatestLearnerAssessments404Error', {})
      cy.task('stubLearnerEducation404Error', {})
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should show "awaiting assessments" content for each skill', () => {
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
            })
        })
      })
    })

    context('learning history section', () => {
      it('should show each result type with a count of 0', () => {
        cy.get('[data-test="learning-history-list"]').then(($list) => {
          cy.get($list)
            .find('li')
            .then(($tags) => {
              cy.get($tags).its('length').should('eq', 5)
              expect($tags.get(0).innerText).to.contain('0 Total courses')
              expect($tags.get(1).innerText).to.contain('0 In progress')
              expect($tags.get(2).innerText).to.contain('0 Achieved')
              expect($tags.get(3).innerText).to.contain('0 Failed')
              expect($tags.get(4).innerText).to.contain('0 Withdrawn')
            })
        })
      })
    })
  })

  context('When the user is in Curious but there is no data', () => {
    const functionalSkillsAssessments = {
      prn: 'G1670VU',
      qualifications: [],
    }
    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubLatestLearnerAssessments', [functionalSkillsAssessments])
      cy.task('stubLearnerEducation', [])
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should show three subjects in the correct format and awaiting assessments content', () => {
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
              expect($summaryLabels.get(0).innerText).to.contain('Maths')
              expect($summaryLabels.get(1).innerText).to.contain('English/Welsh')
              expect($summaryLabels.get(2).innerText).to.contain('Digital Literacy')
            })
        })
      })
    })

    context('learning history section', () => {
      it('should show each result type with a count of 0', () => {
        cy.get('[data-test="learning-history-list"]').then(($list) => {
          cy.get($list)
            .find('li')
            .then(($tags) => {
              cy.get($tags).its('length').should('eq', 5)
              expect($tags.get(0).innerText).to.contain('0 Total courses')
              expect($tags.get(1).innerText).to.contain('0 In progress')
              expect($tags.get(2).innerText).to.contain('0 Achieved')
              expect($tags.get(3).innerText).to.contain('0 Failed')
              expect($tags.get(4).innerText).to.contain('0 Withdrawn')
            })
        })
      })
    })
  })

  context('When the user is in Curious and there is data available', () => {
    const functionalSkillsAssessments = [
      {
        prn: 'G6123VU',
        qualifications: [
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'English',
              qualificationGrade: 'Level 1',
              assessmentDate: '2021-05-13',
            },
          },
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'Maths',
              qualificationGrade: 'Level 1',
              assessmentDate: '2021-05-20',
            },
          },
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'Digital Literacy',
              qualificationGrade: 'Level 2',
              assessmentDate: '2021-05-19',
            },
          },
        ],
      },
    ]

    const learningHistory = [
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

    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      cy.task('stubLearnerEducation', learningHistory)
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should have the correct labels and values', () => {
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 9)
              expect($summaryLabels.get(0).innerText).to.contain('Maths')
              expect($summaryLabels.get(1).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(2).innerText).to.contain('Assessment location')
              expect($summaryLabels.get(3).innerText).to.contain('English/Welsh')
              expect($summaryLabels.get(4).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(5).innerText).to.contain('Assessment location')
              expect($summaryLabels.get(6).innerText).to.contain('Digital Literacy')
              expect($summaryLabels.get(7).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(8).innerText).to.contain('Assessment location')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 9)
              expect($summaryValues.get(0).innerText).to.contain('Level 1')
              expect($summaryValues.get(1).innerText).to.contain('20 May 2021')
              expect($summaryValues.get(2).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(3).innerText).to.contain('Level 1')
              expect($summaryValues.get(4).innerText).to.contain('13 May 2021')
              expect($summaryValues.get(5).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(6).innerText).to.contain('Level 2')
              expect($summaryValues.get(7).innerText).to.contain('19 May 2021')
              expect($summaryValues.get(8).innerText).to.contain('HMP Moorland')
            })
        })
      })
    })

    context('learning history section', () => {
      it('should have the correct labels and counts', () => {
        cy.get('[data-test="learning-history-list"]').then(($list) => {
          cy.get($list)
            .find('li')
            .then(($tags) => {
              cy.get($tags).its('length').should('eq', 5)
              expect($tags.get(0).innerText).to.contain('4 Total courses')
              expect($tags.get(1).innerText).to.contain('1 In progress')
              expect($tags.get(2).innerText).to.contain('1 Achieved')
              expect($tags.get(3).innerText).to.contain('1 Failed')
              expect($tags.get(4).innerText).to.contain('1 Withdrawn')
            })
        })
      })
    })
  })
})
