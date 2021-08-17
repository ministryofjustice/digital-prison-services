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
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should show correct error message', () => {
        cy.get('[data-test="learner-latest-assessments-errorMessage"]').should('have.text', apiErrorText)
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
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should show three subjects in the correct format and awaiting assessments content', () => {
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
              expect($summaryLabels.get(0).innerText).to.contain('English')
              expect($summaryLabels.get(1).innerText).to.contain('Maths')
              expect($summaryLabels.get(2).innerText).to.contain('Digital Literacy')
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

    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      visitWorkAndSkillsAndExpandAccordions()
    })

    context('functional skills section', () => {
      it('should have the correct labels and values', () => {
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 9)
              expect($summaryLabels.get(0).innerText).to.contain('English')
              expect($summaryLabels.get(1).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(2).innerText).to.contain('Assessment location')
              expect($summaryLabels.get(3).innerText).to.contain('Maths')
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
              expect($summaryValues.get(1).innerText).to.contain('13 May 2021')
              expect($summaryValues.get(2).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(3).innerText).to.contain('Level 1')
              expect($summaryValues.get(4).innerText).to.contain('20 May 2021')
              expect($summaryValues.get(5).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(6).innerText).to.contain('Level 2')
              expect($summaryValues.get(7).innerText).to.contain('19 May 2021')
              expect($summaryValues.get(8).innerText).to.contain('HMP Moorland')
            })
        })
      })
    })
  })
})
