const cellConfirmationPage = require('../../pages/cellMove/cellMoveConfirmationPage')

const offenderNo = 'A1234A'
const cellId = 1

context('A user get confirmation of a cell move', () => {
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

  it('should page with the correct offender name and cell description', () => {
    const page = cellConfirmationPage.goTo({ offenderNo, cellId, cellDescription: 'MDI-1-1', name: 'Bob Doe' })

    page.backLink().should('be.visible')
    page
      .backLink()
      .invoke('attr', 'href')
      .then(href => {
        expect(href).to.equal('/prisoner/A1234A')
      })

    page.backToSearchLink().should('be.visible')
    page
      .backToSearchLink()
      .invoke('attr', 'href')
      .then(href => {
        expect(href).to.equal('/prisoner-search')
      })

    cy.get("[data-test='exit-survey-link']")
      .invoke('attr', 'href')
      .then(href => {
        expect(href).to.equal('https://www.surveymonkey.co.uk/r/5QLYDWY')
      })
  })
})
