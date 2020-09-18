const ConfirmCellMovePage = require('../../pages/cellMove/confirmCellMovePage')

const { assertHasRequestCount } = require('../assertions')

const offenderNo = 'A1234A'

context('A user can confirm the cell move', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId: 1234,
    })
    cy.task('stubLocation', {
      locationId: 1,
      locationData: { parentLocationId: 2, description: 'MDI-1-1', locationPrefix: 'MDI-1' },
    })
    cy.task('stubMoveToCell')
    cy.task('stubMoveToCellSwap')
    cy.task('stubAttributesForLocation', {
      capacity: 2,
    })
  })

  it('should display correct location and warning text', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 1, 'Bob Doe', 'MDI-1-1')

    page.warning().contains('You must have checked any local processes for non-associations.')
  })

  it('should make a call to update an offenders cell', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 1, 'Bob Doe', 'MDI-1-1')

    page
      .form()
      .submitButton()
      .click()

    cy.task('verifyMoveToCell', { bookingId: 1234, locationPrefix: 'MDI-1' }).then(assertHasRequestCount(1))

    cy.location('pathname').should('eq', '/prisoner/A12345/cell-move/confirmation')
  })

  it('should navigate back to select cell', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 1, 'Bob Doe', 'MDI-1-1')

    page.backToSelectCellLink().click()

    cy.location('pathname').should('eq', '/prisoner/A12345/cell-move/select-cell')
  })

  it('should display C-SWAP location', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 'C-SWAP', 'Bob Doe', 'swap')

    page.warning().should('not.be.visible')
  })

  it('should the move to C-SWAP', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 'C-SWAP', 'Bob Doe', 'swap')

    page
      .form()
      .submitButton()
      .click()

    cy.task('verifyMoveToCellSwap', { bookingId: 1234 }).then(assertHasRequestCount(1))

    cy.location('pathname').should('eq', '/prisoner/A12345/cell-move/cswap-confirmation')
  })
})
