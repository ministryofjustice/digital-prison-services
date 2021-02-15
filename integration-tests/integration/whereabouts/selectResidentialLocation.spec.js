const moment = require('moment')

// copy of shared/getCurrentTimePeriod.js
const getCurrentTimePeriod = (time = moment()) => {
  const midnight = moment('12:00a', 'HH:mm a')
  const midday = moment('12:00p', 'HH:mm a')
  const evening = moment('17:00p', 'HH:mm a')

  const isMorning = time.isBetween(midnight, midday, null, '[)')
  const isAfternoon = time.isBetween(midday, evening, null, '[)')

  if (isMorning) return 'AM'
  if (isAfternoon) return 'PM'
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
    cy.get('[data-test="period-select"]').should('have.value', getCurrentTimePeriod(today))
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
    cy.get('#period-select').should('have.value', getCurrentTimePeriod(today))
  })
})
