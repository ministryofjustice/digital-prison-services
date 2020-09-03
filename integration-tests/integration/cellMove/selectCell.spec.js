const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SelectCellPage = require('../../pages/cellMove/selectCellPage')

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
  })

  context('with cell data', () => {
    beforeEach(() => {
      cy.task('stubCellsWithCapacity', {
        cells: [
          {
            attributes: [{ description: 'Special Cell', code: 'SPC' }, { description: 'Gated Cell', code: 'GC' }],
            capacity: 2,
            description: 'LEI-1-2',
            id: 1,
            noOfOccupants: 2,
            userDescription: 'LEI-1-1',
          },
          {
            attributes: [{ code: 'LC', description: 'Listener Cell' }],
            capacity: 3,
            description: 'LEI-1-1',
            id: 1,
            noOfOccupants: 2,
            userDescription: 'LEI-1-1',
          },
        ],
      })
    })

    it('should load without error', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.checkStillOnPage()
    })

    it('should display the correct cell information', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.cellResults().then($table => {
        cy.get($table)
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 4) // 2 results plus header and cell swap rows
            expect($tableRows.get(1).innerText).to.contain('LEI-1-1\tListener Cell\t3\t1\tSelect cell')
            expect($tableRows.get(2).innerText).to.contain('LEI-1-2\tGated Cell\nSpecial Cell\t2\t0\tSelect cell')
            expect($tableRows.last().get(0).innerText).to.contain('Cell swap\tSelect')
          })
      })
    })

    it('should sort correctly when sorting by location and also keep cell swap at the bottom', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.locationTableHeader().click()

      page.cellResults().then($table => {
        cy.get($table)
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 4) // 2 results plus header and cell swap rows
            expect($tableRows.get(1).innerText).to.contain('LEI-1-2\tGated Cell\nSpecial Cell\t2\t0\tSelect cell')
            expect($tableRows.get(2).innerText).to.contain('LEI-1-1\tListener Cell\t3\t1\tSelect cell')
            expect($tableRows.last().get(0).innerText).to.contain('Cell swap\tSelect')
          })
      })
    })
  })
})
