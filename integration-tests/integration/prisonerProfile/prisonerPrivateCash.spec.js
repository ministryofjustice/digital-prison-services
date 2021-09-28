const moment = require('moment')

const toTransaction = ($cell) => ({
  date: $cell[0]?.textContent,
  moneyIn: $cell[1]?.textContent,
  moneyOut: $cell[2]?.textContent,
  balance: $cell[3]?.textContent,
  paymentDescription: $cell[4]?.textContent,
  location: $cell[5]?.textContent,
})

context('Prisoner private cash', () => {
  const offenderNo = 'A1234A'
  const addHoldFunds = [
    {
      offenderId: 1,
      transactionId: 234,
      transactionEntrySequence: 1,
      entryDate: '2020-11-27',
      createDateTime: '2020-11-27:10:00',
      transactionType: 'HOA',
      entryDescription: 'HOLD',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 1000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
      currentBalance: 1000,
    },
  ]
  const withheldFunds = [
    {
      offenderId: 1,
      transactionId: 345,
      transactionEntrySequence: 1,
      entryDate: '2020-11-26',
      createDateTime: '2020-11-26:10:00',
      transactionType: 'WHF',
      entryDescription: 'WITHHELD',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 2000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
      currentBalance: 1000,
    },
  ]

  const privateCashResponse = [
    ...addHoldFunds,
    ...withheldFunds,
    {
      offenderId: 1,
      transactionId: 123,
      transactionEntrySequence: 1,
      entryDate: '2020-11-22',
      createDateTime: '2020-11-22:10:00',
      transactionType: 'ATOF',
      entryDescription: 'Cash To Spends Transfer',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 500,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
      currentBalance: 20000,
    },
    {
      offenderId: 1,
      transactionId: 456,
      transactionEntrySequence: 1,
      entryDate: '2020-11-16',
      createDateTime: '2020-11-16:11:00',
      transactionType: 'POST',
      entryDescription: 'Money Through Post',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 20000,
      accountType: 'REG',
      postingType: 'CR',
      agencyId: 'MDI',
      currentBalance: 20500,
    },
    {
      offenderId: 1,
      transactionId: 789,
      transactionEntrySequence: 1,
      entryDate: '2020-11-16',
      createDateTime: '2020-11-16:10:00',
      transactionType: 'POST',
      entryDescription: 'Bought some food',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 10000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'LEI',
      currentBalance: 500,
    },
  ]

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  context('With data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
        response: addHoldFunds,
        transactionType: 'HOA',
      })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
        response: withheldFunds,
        transactionType: 'WHF',
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
      cy.get('[data-test="private-cash-current-balance"]').contains('£95.00')
      // cy.get('[data-test="private-cash-pending-balance"]').contains('-£30.00')
      cy.get('[data-test="private-cash-month"]').should('have.value', '10')
      cy.get('[data-test="private-cash-year"]').should('have.value', '2020')
      cy.get('[data-test="private-cash-pending-table"]').then(($table) => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 2)

            const transactions = Array.from($tableRows).map(($row) => toTransaction($row.cells))

            expect(transactions).to.deep.equal([
              {
                balance: 'Moorland',
                date: '27/11/2020',
                location: undefined,
                moneyIn: '£10.00',
                moneyOut: 'HOLD',
                paymentDescription: undefined,
              },
              {
                balance: 'Moorland',
                date: '26/11/2020',
                location: undefined,
                moneyIn: '£20.00',
                moneyOut: 'WITHHELD',
                paymentDescription: undefined,
              },
            ])
          })
      })
      cy.get('[data-test="private-cash-non-pending-table"]').then(($table) => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 5)

            const transactions = Array.from($tableRows).map(($row) => toTransaction($row.cells))

            expect(transactions).to.deep.equal([
              {
                date: '27/11/2020',
                moneyIn: '',
                moneyOut: '-£10.00',
                balance: '£10.00',
                paymentDescription: 'HOLD',
                location: 'Moorland',
              },
              {
                date: '26/11/2020',
                moneyIn: '',
                moneyOut: '-£20.00',
                balance: '£10.00',
                paymentDescription: 'WITHHELD',
                location: 'Moorland',
              },
              {
                date: '22/11/2020',
                moneyIn: '',
                moneyOut: '-£5.00',
                balance: '£200.00',
                paymentDescription: 'Cash To Spends Transfer',
                location: 'Moorland',
              },
              {
                date: '16/11/2020',
                moneyIn: '£200.00',
                moneyOut: '',
                balance: '£205.00',
                paymentDescription: 'Money Through Post',
                location: 'Moorland',
              },
              {
                date: '16/11/2020',
                moneyIn: '',
                moneyOut: '-£100.00',
                balance: '£5.00',
                paymentDescription: 'Bought some food',
                location: 'Leeds',
              },
            ])
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
        transactionType: 'WHF',
      })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'cash',
        response: [],
        fromDate: moment().startOf('month').format('YYYY-MM-DD'),
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
      cy.get('[data-test="private-cash-current-balance"]').contains('£0.00')
      cy.get('[data-test="private-cash-pending-balance"]').should('not.exist')
      cy.get('[data-test="private-cash-month"]').should('have.value', moment().month())
      cy.get('[data-test="private-cash-year"]').should('have.value', moment().year())
      cy.get('[data-test="private-cash-pending-table"]').should('not.exist')
      cy.get('[data-test="private-cash-non-pending-table"]').should('not.exist')
      cy.get('[data-test="private-cash-no-transactions-message"]').contains(
        'There are no payments in or out of this account for the selected month.'
      )
    })
  })
})
