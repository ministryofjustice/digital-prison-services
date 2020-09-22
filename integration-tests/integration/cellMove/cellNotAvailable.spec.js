const noAvailableCellPage = require('../../pages/cellMove/cellNotAvailablePage')

const offenderNo = 'A12345'

context('A user is presented with a cell no longer available error page', () => {
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
  })

  it('should show the correct message', () => {
    const page = noAvailableCellPage.goTo({ offenderNo, cellDescription: 'MDI-1-1' })

    page.body().contains('This cell is no longer available. You must select another cell.')
  })
  it('should set the correct url on the select another cell button', () => {
    const page = noAvailableCellPage.goTo({ offenderNo, cellDescription: 'MDI-1-1' })

    page.selectAnotherCellLink().should('be.visible')
    page
      .selectAnotherCellLink()
      .invoke('attr', 'href')
      .then(href => {
        expect(href).to.equal('/prisoner/A12345/cell-move/select-cell')
      })
  })
  it('should set up the breadcrumbs correctly', () => {
    const page = noAvailableCellPage.goTo({ offenderNo, cellDescription: 'MDI-1-1' })

    page
      .breadcrumbNodes()
      .find('li')
      .then($el => {
        expect($el[0].innerText).to.equal('Home')
        expect($el[1].innerText).to.equal('Doe, Bob')
        expect($el[2].innerText).to.equal('Select cell')
        expect($el[3].innerText).to.equal('Cell not available')
      })
  })
})
