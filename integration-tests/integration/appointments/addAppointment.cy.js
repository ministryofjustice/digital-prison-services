context('A user is redirected to add an appointment', () => {
  const offenderNo = 'A12345'
  beforeEach(() => {
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubPrisonerProfileAddAppointment', {})
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    cy.visit(`/offenders/${offenderNo}/add-appointment`)
  })

  it('The user is redirected', () => {
    cy.location().should((location) => {
      expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/add-appointment`)
    })
  })
})