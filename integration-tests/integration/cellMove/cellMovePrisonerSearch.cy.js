const toOffender = ($cell) => ({
  name: $cell[1]?.textContent,
  prisonNo: $cell[2]?.textContent,
  location: $cell[3]?.textContent,
  alerts: $cell[4]?.textContent,
  cellHistoryText: $cell[5]?.textContent,
  changeCellText: $cell[6]?.textContent,
})

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
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'ROLE_CELL_MOVE' }] })
    cy.signIn()
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

      cy.get('[data-test="prisoner-search-results-table"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 3) // 2 results plus table header

            const offenders = Array.from($tableRows).map(($row) => toOffender($row.cells))

            expect(offenders[1].name).to.contain('Smith, John')
            expect(offenders[1].prisonNo).to.eq('A1234BC')
            expect(offenders[1].location).to.eq('UNIT-1')
            expect(offenders[1].alerts).to.contain('Arsonist')
            expect(offenders[1].cellHistoryText).to.contain('View cell history')
            expect(offenders[1].changeCellText).to.contain('Change cell')

            expect(offenders[2].name).to.contain('Smith, Steve')
            expect(offenders[2].prisonNo).to.eq('B4567CD')
            expect(offenders[2].location).to.eq('UNIT-2')
            expect(offenders[2].cellHistoryText).to.contain('View cell history')
            expect(offenders[2].changeCellText).to.contain('Change cell')
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

      cy.get('[data-test="prisoner-cell-history-link"]').then(($prisonerProfileLinks) => {
        cy.get($prisonerProfileLinks).its('length').should('eq', 1)
        cy.get($prisonerProfileLinks.get(0))
          .should('have.text', 'View cell history for John Smith')
          .should('have.attr', 'href')
          .should('include', '/prisoner/A1234BC/cell-history')
      })

      cy.get('[data-test="prisoner-cell-search-link"]').then(($prisonerProfileLinks) => {
        cy.get($prisonerProfileLinks).its('length').should('eq', 1)
        cy.get($prisonerProfileLinks.get(0))
          .should('have.text', 'John Smith - Change cell')
          .should('have.attr', 'href')
          .should('include', '/prisoner/A1234BC/cell-move/search-for-cell')
      })
    })
  })

  context('When the user does not have the correct cell move roles', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [] })
      cy.signIn()
    })

    it('should display page not found', () => {
      cy.visit('/change-someones-cell', { failOnStatusCode: false })

      cy.get('h1').contains('Page not found')
    })
  })
})
