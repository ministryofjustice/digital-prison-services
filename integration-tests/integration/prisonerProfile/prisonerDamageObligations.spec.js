context('Prisoner damage obligations', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubGetPrisonerDamageObligations', {
        damageObligations: [
          {
            id: 1,
            offenderNo,
            referenceNumber: '123',
            startDateTime: '2018-11-10T00:00:00',
            endDateTime: '2020-12-10T00:00:00',
            prisonId: 'MDI',
            amountToPay: 300,
            amountPaid: 85.41,
            status: 'ACTIVE',
            comment: 'Damage of Pool table',
            currency: 'GBP',
          },
          {
            id: 2,
            offenderNo,
            referenceNumber: '456',
            startDateTime: '2019-01-10T00:00:00',
            endDateTime: '2020-01-10T00:00:00',
            prisonId: 'LEI',
            amountToPay: 100,
            amountPaid: 40,
            status: 'ACTIVE',
            currency: 'GBP',
          },
          {
            id: 3,
            offenderNo,
            referenceNumber: '789',
            startDateTime: '2018-11-10T00:00:00',
            endDateTime: '2022-12-10T00:00:00',
            prisonId: 'MDI',
            amountToPay: 200,
            amountPaid: 200,
            status: 'INACTIVE',
            comment: 'Damage to cell',
            currency: 'GBP',
          },
        ],
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
    })

    it('should load and display the correct data', () => {
      cy.visit(`/prisoner/${offenderNo}/prisoner-finance-details/damage-obligations`)

      cy.get('h1').contains('Damage obligations for John Smith')
      cy.get('[data-test="total-owed"]').contains('£274.59')
      cy.get('[data-test="tabs-damage-obligations"]')
        .contains('Damage obligations')
        .should('have.attr', 'aria-label', 'View damage obligations account')
        .parent()
        .should('have.class', 'govuk-tabs__list-item--selected')

      cy.get('[data-test="damage-obligations-table"]').then(($table) => {
        cy.get($table)
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 2)
            expect($tableRows.get(0).innerText).to.contain(
              '2\t456\t10/01/2019 to 10/01/2020\t£100.00\t£40.00\t£60.00\tLeeds'
            )
            expect($tableRows.get(1).innerText).to.contain(
              '1\t123\t10/11/2018 to 10/12/2020\t£300.00\t£85.41\t£214.59\tMoorland - Damage of Pool table'
            )
          })
      })
    })
  })
})
