const DeletedSingleAppointmentPage = require('../../pages/appointments/deletedSingleAppointmentPage')
const DeletedMultipleAppointmentsPage = require('../../pages/appointments/deletedMultipleAppointmentsPage')

context('Deleted appointment page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
  })

  it('A user successfully deletes a single appointment then navigates to view all appointments page', () => {
    cy.visit(`/appointment-details/deleted`)
    const deletedSingleAppointmentPage = DeletedSingleAppointmentPage.verifyOnPage()

    deletedSingleAppointmentPage
      .finishLink()
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('/view-all-appointments')
      })
  })

  it('A user successfully deletes multiple appointments then navigates to view all appointments page', () => {
    cy.visit(`/appointment-details/deleted?multipleDeleted=true`)
    const deletedMultipleAppointmentPage = DeletedMultipleAppointmentsPage.verifyOnPage()

    deletedMultipleAppointmentPage
      .finishLink()
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('/view-all-appointments')
      })
  })
})
