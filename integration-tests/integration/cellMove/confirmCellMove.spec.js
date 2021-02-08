const ConfirmCellMovePage = require('../../pages/cellMove/confirmCellMovePage')

const { assertHasRequestCount } = require('../assertions')

const offenderNo = 'A1234A'
const bookingId = 1234

context('A user can confirm the cell move', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId,
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
    cy.task('stubCaseNoteTypes', [
      {
        code: 'MOVED_CELL',
        subCodes: [{ code: 'ADM', description: 'Administrative' }, { code: 'BEH', description: 'Behaviour' }],
      },
    ])
  })

  it('should display correct location and warning text', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 1, 'Bob Doe', 'MDI-1-1')

    page.warning().contains('You must have checked any local processes for non-associations.')
  })

  it('should make a call to update an offenders cell', () => {
    const page = ConfirmCellMovePage.goTo(offenderNo, 1, 'Bob Doe', 'MDI-1-1')
    const comment = 'Hello world'
    page
      .form()
      .reason()
      .click()
    page
      .form()
      .comment()
      .type(comment)
    page
      .form()
      .submitButton()
      .click()

    cy.task('verifyMoveToCell', {
      bookingId,
      offenderNo,
      cellMoveReasonCode: 'ADM',
      internalLocationDescriptionDestination: 'MDI-1',
      commentText: comment,
    }).then(assertHasRequestCount(1))

    cy.location('pathname').should('eq', `/prisoner/${offenderNo}/cell-move/confirmation`)
  })

  it('should navigate back to select cell', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 1, 'Bob Doe', 'MDI-1-1')

    page.backToSelectCellLink().click()

    cy.location('pathname').should('eq', '/prisoner/A12345/cell-move/select-cell')
  })

  it('should display C-SWAP location', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 'C-SWAP', 'Bob Doe', 'swap')

    page.warning().should('not.exist')
  })

  it('should the move to C-SWAP', () => {
    const page = ConfirmCellMovePage.goTo('A12345', 'C-SWAP', 'Bob Doe', 'swap')

    page
      .form()
      .submitButton()
      .click()

    cy.task('verifyMoveToCellSwap', { bookingId: 1234 }).then(assertHasRequestCount(1))

    cy.location('pathname').should('eq', '/prisoner/A12345/cell-move/space-created')
  })
})
