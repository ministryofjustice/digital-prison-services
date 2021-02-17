const caseload = 'MDI'
const date = new Date().toISOString().split('T')[0]

context('Select activity location', () => {
  const headerText = 'View by activity or appointment location'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGroups', { id: caseload })
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubActivityLocations')
    cy.task('stubGetAbsenceReasons')
    cy.task('stubActivityLocations')
  })

  it('should redirect to the activity lists page', () => {
    cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: 'AM', date })
    cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: 'AM', date })

    cy.visit('/manage-prisoner-whereabouts/select-location')

    cy.get('h1').contains(headerText)
    cy.get('#current-location').select('loc2')

    cy.get('h1').contains(headerText)
    cy.get('[type="submit"]').click()

    cy.location('pathname').should('eq', '/manage-prisoner-whereabouts/activity-results')

    cy.get('h1').contains('loc2')
  })
})
