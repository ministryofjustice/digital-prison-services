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

  it('should load without error', () => {
    cy.task('stubCellsWithCapacity', {
      cells: [
        {
          attributes: [
            {
              code: 'LC',
              description: 'Listener Cell',
            },
          ],
          capacity: 2,
          description: 'LEI-1-1',
          id: 1,
          noOfOccupants: 2,
          userDescription: 'LEI-1-1',
        },
      ],
    })

    const page = SelectCellPage.goTo(offenderNo)

    page.checkStillOnPage()
  })
})
