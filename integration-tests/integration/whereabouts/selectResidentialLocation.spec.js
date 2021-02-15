const moment = require('moment')

// copy of { getCurrentPeriod } from backend/utils/.js
const getCurrentPeriod = date => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = moment(date).format('H')

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

context('Select residential location', () => {
  const caseload = 'MDI'
  const today = moment()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGroups', { id: 'caseload' })
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.task('stubGroups', { id: 'MDI' })
    cy.login()
  })

  it('should display the correct form with correct content', () => {
    cy.visit('/manage-prisoner-whereabouts/select-residential-location')

    cy.get('h1').should('contain', 'View by residential location')
    cy.get('[data-test="date-select"]').should('have.value', today.format('DD/MM/YYYY'))
    cy.get('[data-test="period-select"]').should('have.value', getCurrentPeriod(today))
    cy.get('[data-test="location-select"]').should('have.value', '')
  })

  it('should display errors', () => {
    cy.visit('/manage-prisoner-whereabouts/select-residential-location')

    cy.get('button[type="submit"]').click()
    cy.get('[data-test="form-errors"]').contains('Select a location')
  })

  it('should redirect to houseblock results page with the correctly selected values', () => {
    cy.visit('/manage-prisoner-whereabouts/select-residential-location')

    cy.get('[data-test="location-select"]').select('1')
    cy.get('button[type="submit"]').click()

    cy.get('h1').should('contain', '1 - All')
    cy.get('[name="search-date"]').should('have.value', today.format('DD/MM/YYYY'))
    cy.get('#period-select').should('have.value', getCurrentPeriod(today))
  })
})
