const moment = require('moment')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SelectLocationPage = require('../../pages/cellMove/selectLocationPage')
const OffenderDetailsPage = require('../../pages/cellMove/offenderDetailsPage')

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
    cy.task('stubGroups', { id: 'MDI' })
    cy.task('stubCellAttributes')
    cy.task('stubUserMeRoles', [{ roleCode: 'CELL_MOVE' }])
    cy.task('stubUserCaseLoads')
  })

  it('Shows the correct data for no non-associations and no csra comment', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    const selectLocationPage = SelectLocationPage.verifyOnPage()
    cy.get('[data-test="cell-move-header-information"]').then($header => {
      cy.get($header)
        .find('h3')
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
          assessmentDescription: 'CSR',
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
    cy.get('[data-test="cell-move-header-information"]').then($header => {
      cy.get($header)
        .find('h3')
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

  it('Passes the correct data to the select a cell page', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    const selectLocationPage = SelectLocationPage.verifyOnPage()
    const form = selectLocationPage.form()
    form.location().select('1')
    form.attribute().select('Listener Cell')
    form.submitButton().click()
    cy.url().should('include', 'select-cell?location=1&attribute=LC')
  })

  it('Correctly navigates between this page and offender details', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    cy.task('stubOffenderFullDetails', {
      ...offenderFullDetails,
      age: 29,
      religion: 'Some religion',
      physicalAttributes: {
        ethnicity: 'White',
        raceCode: 'W1',
      },
      profileInformation: [{ type: 'SEXO', resultValue: 'Heterosexual' }, { type: 'SMOKE', resultValue: 'No' }],
    })
    cy.task('stubMainOffence', [{ offenceDescription: '13 hours overwork' }])
    const selectLocationPage = SelectLocationPage.verifyOnPage()
    selectLocationPage.detailsLink().click()
    const offenderDetailsPage = OffenderDetailsPage.verifyOnPage()
    offenderDetailsPage.backLink().click()
    SelectLocationPage.verifyOnPage()
  })
})
