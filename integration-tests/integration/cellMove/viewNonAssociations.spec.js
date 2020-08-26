const moment = require('moment')

const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const NonAssociationsPage = require('../../pages/cellMove/nonAssociationsPage')

const offenderNo = 'A12345'
const tomorrow = moment()
  .add(1, 'days')
  .format('YYYY-MM-DDTHH:mm:ss')

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
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubBookingNonAssociations', {
      offenderNo: 'A12345',
      firstName: 'John',
      lastName: 'Smith',
      agencyDescription: 'Moorland (HMP & YOI)',
      assignedLivingUnitDescription: 'MDI-1-1-3',
      nonAssociations: [
        {
          reasonCode: 'VIC',
          reasonDescription: 'Victim',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: moment().subtract(10, 'days'),
          authorisedBy: 'string',
          comments: 'Test comment 1',
          offenderNonAssociation: {
            offenderNo: 'ABC124',
            firstName: 'Joseph',
            lastName: 'Bloggs',
            reasonCode: 'PER',
            reasonDescription: 'Perpetrator',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-2',
          },
        },
        {
          reasonCode: 'RIV',
          reasonDescription: 'Rival gang',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: '2019-12-01T13:34:00',
          expiryDate: tomorrow,
          authorisedBy: 'string',
          comments: 'Test comment 2',
          offenderNonAssociation: {
            offenderNo: 'ABC125',
            firstName: 'Jim',
            lastName: 'Bloggs',
            reasonCode: 'RIV',
            reasonDescription: 'Rival gang',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-3',
          },
        },
        {
          reasonCode: 'VIC',
          reasonDescription: 'Victim',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: '2018-12-01T13:34:00',
          expiryDate: '2019-12-01T13:34:00',
          authorisedBy: 'string',
          comments: 'Test comment 3',
          offenderNonAssociation: {
            offenderNo: 'ABC125',
            firstName: 'Jim',
            lastName: 'Bloggs',
            reasonCode: 'PER',
            reasonDescription: 'Perpetrator',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-3',
          },
        },
      ],
    })
  })

  it('Shows the correct data for non-associations', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/non-associations`)
    const nonAssociationsPage = NonAssociationsPage.verifyOnPage()
    nonAssociationsPage.message().contains('You must check any local processes for non-association details.')
    nonAssociationsPage.backLink().contains('Return to select a location')
    cy.get(`[data-test="non-association-summary-ABC125"]`).then($section => {
      cy.get($section)
        .find('dt')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 8)
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Prison number')
          expect($headings.get(2).innerText).to.contain('Location')
          expect($headings.get(3).innerText).to.contain('Type')
          expect($headings.get(4).innerText).to.contain('John Smith is')
          expect($headings.get(5).innerText).to.contain('Jim Bloggs is')
          expect($headings.get(6).innerText).to.contain('Comment')
          expect($headings.get(7).innerText).to.contain('Effective date')
        })

      cy.get($section)
        .find('dd')
        .then($summaryValues => {
          cy.get($summaryValues)
            .its('length')
            .should('eq', 8)
          expect($summaryValues.get(0).innerText).to.contain('Bloggs, Jim')
          expect($summaryValues.get(1).innerText).to.contain('ABC125')
          expect($summaryValues.get(2).innerText).to.contain('MDI-2-1-3')
          expect($summaryValues.get(3).innerText).to.contain('Do Not Locate on Same Wing')
          expect($summaryValues.get(4).innerText).to.contain('Rival gang')
          expect($summaryValues.get(5).innerText).to.contain('Rival gang')
          expect($summaryValues.get(6).innerText).to.contain('Test comment 2')
          expect($summaryValues.get(7).innerText).to.contain('1 December 2019')
        })
    })

    cy.get(`[data-test="non-association-summary-ABC124"]`).then($section => {
      cy.get($section)
        .find('dt')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 8)
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Prison number')
          expect($headings.get(2).innerText).to.contain('Location')
          expect($headings.get(3).innerText).to.contain('Type')
          expect($headings.get(4).innerText).to.contain('John Smith is')
          expect($headings.get(5).innerText).to.contain('Joseph Bloggs is')
          expect($headings.get(6).innerText).to.contain('Comment')
          expect($headings.get(7).innerText).to.contain('Effective date')
        })

      cy.get($section)
        .find('dd')
        .then($summaryValues => {
          cy.get($summaryValues)
            .its('length')
            .should('eq', 8)
          expect($summaryValues.get(0).innerText).to.contain('Bloggs, Joseph')
          expect($summaryValues.get(1).innerText).to.contain('ABC124')
          expect($summaryValues.get(2).innerText).to.contain('MDI-2-1-2')
          expect($summaryValues.get(3).innerText).to.contain('Do Not Locate on Same Wing')
          expect($summaryValues.get(4).innerText).to.contain('Victim')
          expect($summaryValues.get(5).innerText).to.contain('Perpetrator')
          expect($summaryValues.get(6).innerText).to.contain('Test comment 1')
          expect($summaryValues.get(7).innerText).to.contain(
            moment()
              .subtract(10, 'days')
              .format('D MMMM YYYY')
          )
        })
    })
  })
})
