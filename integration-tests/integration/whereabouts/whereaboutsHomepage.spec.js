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

      cy.get('[data-test="covid-units"]').should('not.exist')
      cy.get('[data-test="bulk-appointments"]').should('not.exist')
    })

    it('should show covid unit task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'PRISON' }])

      cy.visit('/manage-prisoner-whereabouts')

      cy.get('[data-test="covid-units"]').should('exist')
    })

    it('should show bulk appointments task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'BULK_APPOINTMENTS' }])

      cy.visit('/manage-prisoner-whereabouts')

      cy.get('[data-test="bulk-appointments"]').should('exist')
    })
  })
})
