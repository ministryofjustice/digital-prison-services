import moment from 'moment'

const agencyDetails = { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' }
const movementReasons = [
  { code: '1', description: 'Visit Dying Relative' },
  { code: '2', description: 'Adventure And Social Welfare' },
]

context('Scheduled movements', () => {
  const today = moment()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: agencyDetails })
    cy.task('stubMovementReasons', movementReasons)
    cy.signIn()
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
  })

  it('should load page with the correct title', () => {
    cy.get('h1').contains(`People due to leave Moorland (HMP & YOI) on ${today.format('D MMMM YYYY')}`)
  })

  it('should default to the current date formatted correctly', () => {
    cy.get('#date').should('have.value', today.format('DD/MM/YYYY'))
  })

  it('should load all movement reasons into the select box', () => {
    cy.get('#movementReason').contains('Visit Dying Relative')
    cy.get('#movementReason').contains('Adventure And Social Welfare')
  })
})
