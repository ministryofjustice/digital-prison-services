context('Whereabouts homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    it('should non role specific tasks', () => {
      cy.task('stubUserMeRoles')
      cy.visit('/manage-prisoner-whereabouts')

      cy.get('[data-test="view-residential-location"]').should('exist')
      cy.get('[data-test="view-activity-location"]').should('exist')
      cy.get('[data-test="view-all-appointments"]').should('exist')
      cy.get('[data-test="view-unaccounted-for"]').should('exist')
      cy.get('[data-test="view-attendance-statistics"]').should('exist')
      cy.get('[data-test="view-bulk-appointments"]').should('not.exist')
      cy.get('[data-test="view-covid-units"]').should('not.exist')
    })

    it('should show covid unit task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'PRISON' }])
      cy.visit('/manage-prisoner-whereabouts')
      cy.get('[data-test="view-covid-units"]').should('exist')
    })

    it('should show bulk appointments task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'BULK_APPOINTMENTS' }])
      cy.visit('/manage-prisoner-whereabouts')
      cy.get('[data-test="view-bulk-appointments"]').should('exist')
    })
  })
})
