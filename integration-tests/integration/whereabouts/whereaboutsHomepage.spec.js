context('Whereabouts homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')

    cy.task('stubUserMeRoles')
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()
    })

    it('should non role specific tasks', () => {
      cy.visit('/manage-prisoner-whereabouts')

      cy.get('[data-test="view-residential-location"]').should('exist')
      cy.get('[data-test="view-activity-location"]').should('exist')
      cy.get('[data-test="view-all-appointments"]').should('exist')
      cy.get('[data-test="view-unaccounted-for"]').should('exist')
      cy.get('[data-test="view-attendance-statistics"]').should('exist')
    })
  })
})
