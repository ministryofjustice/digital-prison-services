const moment = require('moment')

context('Prisoner spends', () => {
  const offenderNo = 'A1234A'
  const spendsResponse = [
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
      accountType: 'SPND',
      postingType: 'DR',
      offenderNo,
      agencyId: 'MDI',
      relatedOffenderTransactions: [],
      currentBalance: 19500,
    },
    {
      offenderId: 1,
      transactionId: 123,
      transactionEntrySequence: 1,
      entryDate: '2020-12-01',
      transactionType: 'A_EARN',
      entryDescription: 'Offender Payroll From:01/12/2020 To:01/12/2020',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 50,
      accountType: 'SPND',
      postingType: 'CR',
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
        accountCode: 'spends',
        response: spendsResponse,
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
        damageObligations: 101,
      })
    })

    it('should load and display the correct content', () => {
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/spends?month=10&year=2020`)

      cy.get('[data-test="tabs-spends"]')
        .contains('Spends')
        .should('have.attr', 'aria-label', 'View spends account')
        .parent()
        .should('have.class', 'govuk-tabs__list-item--selected')
      cy.get('[data-test="tabs-damage-obligations"]').should('be.visible')
      cy.get('h1').contains('Spends account for John Smith')
      cy.get('[data-test="spends-current-balance"]').contains('£50.00')
      cy.get('[data-test="spends-month"]').should('have.value', '10')
      cy.get('[data-test="spends-year"]').should('have.value', '2020')
      cy.get('[data-test="spends-table"]').then($table => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 2)
            expect($tableRows.get(0).innerText).to.contain(
              '02/12/2020\t\t£10.00\t£195.00\tSub-Account Transfer\tMoorland'
            )
            expect($tableRows.get(1).innerText).to.contain(
              '01/12/2020\t£0.50\t\t£205.00\tOffender Payroll From:01/12/2020 To:01/12/2020\tLeeds'
            )
          })
      })
    })
  })

  context('Without data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetTransactionHistory', {
        accountCode: 'spends',
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
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/spends`)

      cy.get('[data-test="tabs-damage-obligations"]').should('not.exist')
      cy.get('h1').contains('Spends account for John Smith')
      cy.get('[data-test="spends-current-balance"]').contains('£0.00')
      cy.get('[data-test="spends-month"]').should('have.value', moment().month())
      cy.get('[data-test="spends-year"]').should('have.value', moment().year())
      cy.get('[data-test="spends-table"]').should('not.exist')
      cy.get('[data-test="spends-no-transactions-message"]').contains(
        'There are no payments in or out of this account for the selected month.'
      )
    })
  })
})
