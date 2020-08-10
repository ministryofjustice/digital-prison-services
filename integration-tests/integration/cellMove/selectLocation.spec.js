const moment = require('moment')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SelectLocationPage = require('../../pages/cellMove/selectLocationPage')

const offenderNo = 'A12345'

context('A user can select a cell', () => {
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
    cy.task('stubBookingNonAssociations', {})
  })

  it('Shows the correct data for no non-associations and no csra comment', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    const selectLocationPage = SelectLocationPage.verifyOnPage()
    cy.get('.cell-move-header').then($header => {
      cy.get($header)
        .find('h2')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 5)
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Current location')
          expect($headings.get(2).innerText).to.contain('CSRA rating')
          expect($headings.get(3).innerText).to.contain('Relevant alerts')
          expect($headings.get(4).innerText).to.contain('Non-associations')
        })
    })
    selectLocationPage.name().contains('Smith, John')
    selectLocationPage.livingUnit().contains('HMP Moorland')
    selectLocationPage.csra().contains('High')
    selectLocationPage.csraLink().should('not.be.visible')
    selectLocationPage.alerts().contains('None')
    selectLocationPage.nonAssociationsLink().should('not.be.visible')
    selectLocationPage.nonAssociationsMessage().contains('You must also check any local processes')
  })

  it('Shows the correct data when there is a relevant non-association and a CSR rating comment', () => {
    cy.task('stubOffenderFullDetails', {
      ...offenderFullDetails,
      alerts: [
        {
          active: true,
          addedByFirstName: 'John',
          addedByLastName: 'Smith',
          alertCode: 'XGANG',
          alertCodeDescription: 'Gang member',
          alertId: 1,
          alertType: 'X',
          alertTypeDescription: 'Security',
          bookingId: 14,
          comment: 'silly',
          dateCreated: '2019-08-25',
          dateExpires: '2019-09-20',
          expired: false,
          expiredByFirstName: 'Jane',
          expiredByLastName: 'Smith',
          offenderNo: 'G3878UK',
        },
      ],
      assessments: [
        {
          assessmentCode: 'CSR',
          assessmentComment: 'Test comment',
        },
      ],
    })
    cy.task('stubBookingNonAssociations', {
      nonAssociations: [
        {
          effectiveDate: moment(),
          expiryDate: moment().add(2, 'days'),
          offenderNonAssociation: {
            agencyDescription: 'HMP Moorland',
          },
        },
      ],
    })
    const selectLocationPage = SelectLocationPage.verifyOnPage()
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    cy.get('.cell-move-header').then($header => {
      cy.get($header)
        .find('h2')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 5)
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Current location')
          expect($headings.get(2).innerText).to.contain('CSRA rating')
          expect($headings.get(3).innerText).to.contain('Relevant alerts')
          expect($headings.get(4).innerText).to.contain('Non-associations')
        })
    })
    selectLocationPage.name().contains('Smith, John')
    selectLocationPage.detailsLink().contains('View details')
    selectLocationPage.livingUnit().contains('HMP Moorland')
    selectLocationPage.csra().contains('High')
    selectLocationPage.csraLink().contains('View details')
    selectLocationPage.alerts().contains('Gang member')
    selectLocationPage.nonAssociationsLink().contains('View non-associations')
    selectLocationPage.nonAssociationsMessage().should('not.be.visible')
  })
})
