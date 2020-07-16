const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const visitsWithVisitors = require('../../mockApis/responses/visitsWithVisitors.json')

context('Prisoner visits', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubVisitsWithVisitors', { offenderBasicDetails })
    })

    it('should handle no results and have the correct page title', () => {
      cy.visit(`/prisoner/${offenderNo}/visits`)

      cy.get('[data-test="no-visit-results"]').should('contain.text', 'There are no visits for this prisoner')
      cy.get('h1').should('have.text', 'John Smith`s visits')
    })

    it('should maintain form selections from search query', () => {
      cy.visit(`/prisoner/${offenderNo}/visits?visitType=OFFI&fromDate=17%2F07%2F2020&toDate=17%2F08%2F2020`)

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', 'OFFI')
      cy.get('[data-test="from-filter"]').should('have.value', '17/07/2020')
      cy.get('[data-test="to-filter"]').should('have.value', '17/08/2020')
    })

    it('should have a working clear link on the search form', () => {
      cy.visit(`/prisoner/${offenderNo}/visits?visitType=OFFI&fromDate=17%2F07%2F2020&toDate=17%2F08%2F2020`)

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', 'OFFI')
      cy.get('[data-test="from-filter"]').should('have.value', '17/07/2020')
      cy.get('[data-test="to-filter"]').should('have.value', '17/08/2020')

      cy.get('[data-test="clear-link"]').click()

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', '')
      cy.get('[data-test="from-filter"]').should('have.value', '')
      cy.get('[data-test="to-filter"]').should('have.value', '')
    })
  })

  context('When there is data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubVisitsWithVisitors', {
        offenderBasicDetails,
        visitsWithVisitors,
      })
    })

    it('should have the same number of table rows as individual visitors from all visits', () => {
      const individualVisitors = visitsWithVisitors.content.reduce((acc, item) => {
        return acc + item.visitors.length
      }, 0)

      cy.visit(`/prisoner/${offenderNo}/visits`)

      cy.get('[data-test="prisoner-visits-results"]').then($table => {
        cy.get($table)
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', individualVisitors + 1) // results plus table header
          })
      })
    })
  })
})
