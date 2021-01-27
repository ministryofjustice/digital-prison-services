const moment = require('moment')

context('Prisoner savings', () => {
  const offenderNo = 'A1234A'
  const savingsResponse = [
    {
      offenderId: 1,
      transactionId: 456,
      transactionEntrySequence: 1,
      entryDate: '2020-12-02',
      transactionType: 'OT',
      entryDescription: 'Sub-Account Transfer',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 1000,
      accountType: 'SAV',
      postingType: 'CR',
      offenderNo,
      agencyId: 'MDI',
      relatedOffenderTransactions: [],
      currentBalance: 21500,
    },
    {
      offenderId: 1,
      transactionId: 123,
      transactionEntrySequence: 1,
      entryDate: '2020-12-01',
      transactionType: 'OT',
      entryDescription: 'Sub-Account Transfer',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 50,
      accountType: 'SAV',
      postingType: 'DR',
      offenderNo,
      agencyId: 'LEI',
      relatedOffenderTransactions: [],
      currentBalance: 20500,
    },
  ]

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('With data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'savings',
        response: savingsResponse,
        fromDate: '2020-11-01',
        toDate: '2020-11-30',
      })
      cy.task('stubAgencyDetails', {
        agencyId: 'LEI',
        details: {
          agencyId: 'LEI',
          description: 'Leeds',
        },
      })
      cy.task('stubAgencyDetails', {
        agencyId: 'MDI',
        details: {
          agencyId: 'MDI',
          description: 'Moorland',
        },
      })
      cy.task('stubPrisonerBalances', {
        cash: 95,
        spends: 50,
        savings: 10,
        damageObligations: 101,
      })
    })

    it('should load and display the correct content', () => {
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/savings?month=10&year=2020`)

      cy.get('[data-test="tabs-savings"]')
        .contains('Savings')
        .should('have.attr', 'aria-label', 'View savings account')
        .parent()
        .should('have.class', 'govuk-tabs__list-item--selected')
      cy.get('[data-test="tabs-damage-obligations"]').should('be.visible')
      cy.get('h1').contains('Savings account for John Smith')
      cy.get('[data-test="savings-current-balance"]').contains('£10.00')
      cy.get('[data-test="savings-month"]').should('have.value', '10')
      cy.get('[data-test="savings-year"]').should('have.value', '2020')
      cy.get('[data-test="savings-table"]').then($table => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 2)
            expect($tableRows.get(0).innerText).to.contain(
              '02/12/2020\t£10.00\t\t£215.00\tSub-Account Transfer\tMoorland'
            )
            expect($tableRows.get(1).innerText).to.contain('01/12/2020\t\t£0.50\t£205.00\tSub-Account Transfer\tLeeds')
          })
      })
    })
  })

  context('Without data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'savings',
        response: [],
        fromDate: moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
      })
      cy.task('stubPrisonerBalances', {
        cash: 0,
        damageObligations: 0,
      })
    })

    it('should load and display the correct content', () => {
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/savings`)

      cy.get('[data-test="tabs-damage-obligations"]').should('not.exist')
      cy.get('h1').contains('Savings account for John Smith')
      cy.get('[data-test="savings-current-balance"]').contains('£0.00')
      cy.get('[data-test="savings-month"]').should('have.value', moment().month())
      cy.get('[data-test="savings-year"]').should('have.value', moment().year())
      cy.get('[data-test="savings-table"]').should('not.exist')
      cy.get('[data-test="savings-no-transactions-message"]').contains(
        'There are no payments in or out of this account for the selected month.'
      )
    })
  })
})
