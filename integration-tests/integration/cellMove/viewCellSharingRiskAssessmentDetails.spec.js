const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails')
const CellSharingRiskAssessmentPage = require('../../pages/cellMove/cellSharingRiskAssessmentDetailsPage')

const offenderNo = 'A12345'

context('A user can view non associations', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubCsraAssessments', {
      offenderNumbers: [offenderNo],
      assessments: [
        {
          bookingId: 1234,
          offenderNo,
          classificationCode: 'STANDARD',
          classification: 'Standard',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR Rating',
          cellSharingAlertFlag: true,
          assessmentDate: '2020-08-17',
          nextReviewDate: '2020-08-19',
          approvalDate: '2020-08-18',
          assessmentAgencyId: 'MDI',
          assessmentStatus: 'A',
          assessmentSeq: 1,
          assessmentComment: 'Some comment',
          assessorId: 1,
          assessorUser: 'TEST_USER',
        },
      ],
    })
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: { description: 'HMP Moorland' } })
  })

  it('Shows the correct data for non-associations', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`)
    const cellSharingRiskAssessmentDetailsPage = CellSharingRiskAssessmentPage.verifyOnPage()
    cy.get('.govuk-summary-list--no-border').then($section => {
      cy.get($section)
        .find('dt')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 6)
          expect($headings.get(0).innerText).to.contain('Cell location')
          expect($headings.get(1).innerText).to.contain('Name')
          expect($headings.get(2).innerText).to.contain('CSRA level')
          expect($headings.get(3).innerText).to.contain('Comments')
          expect($headings.get(4).innerText).to.contain('Assessment date')
          expect($headings.get(5).innerText).to.contain('Assessment location')
        })

      cy.get($section)
        .find('dd')
        .then($summaryValues => {
          cy.get($summaryValues)
            .its('length')
            .should('eq', 6)
          expect($summaryValues.get(0).innerText).to.contain('HMP Moorland')
          expect($summaryValues.get(1).innerText).to.contain('Smith, John')
          expect($summaryValues.get(2).innerText).to.contain('Standard')
          expect($summaryValues.get(3).innerText).to.contain('Some comment')
          expect($summaryValues.get(4).innerText).to.contain('17 August 2020')
          expect($summaryValues.get(5).innerText).to.contain('HMP Moorland')
        })
    })
    cellSharingRiskAssessmentDetailsPage.backLink().contains('Return to select a location')
  })
})
