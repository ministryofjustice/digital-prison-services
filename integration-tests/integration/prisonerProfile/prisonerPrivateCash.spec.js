const moment = require('moment')

context('Prisoner damage obligations', () => {
  const offenderNo = 'A1234A'
  const pendingTransactions = [
    {
      offenderId: 1,
      transactionId: 234,
      transactionEntrySequence: 1,
      entryDate: '2020-11-27',
      transactionType: 'HOA',
      entryDescription: 'HOLD',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 1000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
    },
  ]

  const privateCashResponse = [
    ...pendingTransactions,
    {
      offenderId: 1,
      transactionId: 123,
      transactionEntrySequence: 1,
      entryDate: '2020-11-22',
      transactionType: 'ATOF',
      entryDescription: 'Cash To Spends Transfer',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 500,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
    },
    {
      offenderId: 1,
      transactionId: 456,
      transactionEntrySequence: 1,
      entryDate: '2020-11-16',
      transactionType: 'POST',
      entryDescription: 'Money Through Post',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 20000,
      accountType: 'REG',
      postingType: 'CR',
      agencyId: 'MDI',
    },
    {
      offenderId: 1,
      transactionId: 789,
      transactionEntrySequence: 1,
      entryDate: '2020-11-16',
      transactionType: 'POST',
      entryDescription: 'Bought some food',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 10000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'LEI',
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
        accountCode: 'cash',
        response: pendingTransactions,
        transactionType: 'HOA',
      })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
        response: privateCashResponse,
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
        damageObligations: 101,
      })
    })

    it('should load and display the correct content', () => {
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/private-cash?month=10&year=2020`)

      cy.get('[data-test="tabs-private-cash"]')
        .contains('Private cash')
        .should('have.attr', 'aria-label', 'View private cash account')
        .parent()
        .should('have.class', 'govuk-tabs__list-item--selected')
      cy.get('[data-test="tabs-damage-obligations"]').should('be.visible')
      cy.get('h1').contains('Private cash account for John Smith')
      cy.get('[data-test="current-balance"]').contains('£95.00')
      cy.get('[data-test="pending-balance"]').contains('-£10.00')
      cy.get('[data-test="private-cash-month"]').should('have.value', '10')
      cy.get('[data-test="private-cash-year"]').should('have.value', '2020')
      cy.get('[data-test="private-cash-pending-table"]').then($table => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 1)
            expect($tableRows.get(0).innerText).to.contain('27/11/2020\t\t£10.00\tHOLD\tMoorland')
          })
      })
      cy.get('[data-test="private-cash-non-pending-table"]').then($table => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 3)
            expect($tableRows.get(0).innerText).to.contain('22/11/2020\t\t£5.00\tCash To Spends Transfer\tMoorland')
            expect($tableRows.get(1).innerText).to.contain('16/11/2020\t£200.00\t\tMoney Through Post\tMoorland')
            expect($tableRows.get(2).innerText).to.contain('16/11/2020\t\t£100.00\tBought some food\tLeeds')
          })
      })
    })
  })

  context('Without data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
        response: [],
        transactionType: 'HOA',
      })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
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
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/private-cash`)

      cy.get('[data-test="tabs-damage-obligations"]').should('not.exist')
      cy.get('h1').contains('Private cash account for John Smith')
      cy.get('[data-test="current-balance"]').contains('£0.00')
      cy.get('[data-test="pending-balance"]').should('not.exist')
      cy.get('[data-test="private-cash-month"]').should('have.value', moment().month())
      cy.get('[data-test="private-cash-year"]').should('have.value', moment().year())
      cy.get('[data-test="private-cash-pending-table"]').should('not.exist')
      cy.get('[data-test="private-cash-non-pending-table"]').should('not.exist')
      cy.get('[data-test="no-transactions-message"]').contains(
        'There are no payments in or out of this account for the selected month.'
      )
    })
  })
})
