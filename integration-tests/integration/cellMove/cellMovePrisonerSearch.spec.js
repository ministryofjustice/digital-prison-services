const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

context('Cell move prisoner search', () => {
  const inmate1 = {
    bookingId: 1,
    offenderNo: 'A1234BC',
    firstName: 'JOHN',
    lastName: 'SMITH',
    dateOfBirth: '1990-10-12',
    age: 29,
    agencyId: 'MDI',
    assignedLivingUnitId: 1,
    assignedLivingUnitDesc: 'UNIT-1',
    alertsDetails: ['XA', 'XVL'],
  }
  const inmate2 = {
    bookingId: 2,
    offenderNo: 'B4567CD',
    firstName: 'STEVE',
    lastName: 'SMITH',
    dateOfBirth: '1989-11-12',
    age: 30,
    agencyId: 'MDI',
    assignedLivingUnitId: 2,
    assignedLivingUnitDesc: 'UNIT-2',
    alertsDetails: ['RSS', 'XC'],
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
  })

  context('When there are no search values', () => {
    beforeEach(() => {
      cy.task('stubUserLocations')
    })

    it('should display the search box only', () => {
      cy.visit(`/change-someones-cell/prisoner-search`)

      cy.get('[data-test="prisoner-search-form"]').should('be.visible')
    })
  })

  context('When there are search values', () => {
    beforeEach(() => {
      cy.task('stubUserLocations')
    })

    it('should have correct data pre filled from search query', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.visit(`/change-someones-cell/prisoner-search?keywords=SMITH`)

      cy.get('[data-test="prisoner-search-results-table"]').then($table => {
        cy.get($table)
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 3) // 2 results plus table header
            expect($tableRows.get(1).innerText).to.contain(
              '\tSmith, John\tA1234BC\tUNIT-1\t\nARSONIST\n\n\tView cell history\tChange cell'
            )
            expect($tableRows.get(2).innerText).to.contain('\tSmith, Steve\tB4567CD\tUNIT-2\t\tView cell history\tChange cell')
          })
      })
    })

    it('should have the correct link to the cell history and select cell links', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 1,
        data: [inmate1],
      })
      cy.visit(`/change-someones-cell/prisoner-search?keywords=A1234BC`)

      cy.get('[data-test="prisoner-cell-history-link"]').then($prisonerProfileLinks => {
        cy.get($prisonerProfileLinks)
          .its('length')
          .should('eq', 1)
        cy.get($prisonerProfileLinks.get(0))
          .should('have.attr', 'href')
          .should('include', '/prisoner/A1234BC/cell-history')
      })

      cy.get('[data-test="prisoner-cell-search-link"]').then($prisonerProfileLinks => {
        cy.get($prisonerProfileLinks)
          .its('length')
          .should('eq', 1)
        cy.get($prisonerProfileLinks.get(0))
          .should('have.attr', 'href')
          .should('include', '/prisoner/A1234BC/cell-move/search-for-cell')
      })
    })
  })
})
