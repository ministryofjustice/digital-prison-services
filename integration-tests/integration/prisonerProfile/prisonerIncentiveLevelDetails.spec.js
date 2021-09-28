const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

const title = 'Incentive level details for John Smith'

const iepSummaryResponse = {
  bookingId: -1,
  iepDate: '2017-08-15',
  iepTime: '2017-08-15T16:04:35',
  iepLevel: 'Standard',
  daysSinceReview: 625,
  iepDetails: [
    {
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      agencyId: 'LEI',
      iepLevel: 'Standard',
      userId: 'ITAG_USER',
    },
    {
      bookingId: -1,
      iepDate: '2017-08-10',
      iepTime: '2017-08-10T16:04:35',
      agencyId: 'MDI',
      iepLevel: 'Basic',
      userId: 'ITAG_USER',
    },
    {
      bookingId: -1,
      iepDate: '2017-08-07',
      iepTime: '2017-08-07T16:04:35',
      agencyId: 'MDI',
      iepLevel: 'Enhanced',
      userId: 'ITAG_USER_2',
    },
  ],
}

context('Prisoner incentive level details', () => {
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
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
      cy.task('stubUserMeRoles', [{ roleCode: 'GLOBAL_SEARCH' }, { roleCode: 'MAINTAIN_IEP' }])
      cy.task('stubStaff', {
        staffId: 'ITAG_USER',
        details: {
          username: 'ITAG_USER',
          firstName: 'Staff',
          lastName: 'Member',
        },
      })
      cy.task('stubStaff', {
        staffId: 'ITAG_USER_2',
        details: {
          username: 'ITAG_USER_2',
          firstName: 'Another Staff',
          lastName: 'Member',
        },
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

    it('should display the change incentive level link', () => {
      cy.task('stubIepSummaryForBooking', iepSummaryResponse)

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('h1').should('contain', title)
      cy.get('[data-test="change-incentive-level-link"]')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/prisoner/A1234A/incentive-level-details/change-incentive-level')
        })
    })

    it('should not show change incentive level link if user does not have correct role', () => {
      cy.task('stubIepSummaryForBooking', iepSummaryResponse)

      cy.task('stubUserMeRoles', [{ roleCode: 'GLOBAL_SEARCH' }])

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('[data-test="change-incentive-level-link"]').should('not.exist')
    })

    it('should show correct history', () => {
      cy.task('stubIepSummaryForBooking', iepSummaryResponse)

      cy.get('[data-test="incentive-level-history"]').then(($table) => {
        cy.get($table)
          .find('td')
          .then(($tableCells) => {
            cy.get($tableCells).its('length').should('eq', 15) // 2 rows with 5 cells

            expect($tableCells.get(0)).to.contain('15 August 2017 - 16:04')
            expect($tableCells.get(1)).to.contain('Standard')
            expect($tableCells.get(2)).to.contain('Not entered')
            expect($tableCells.get(3)).to.contain('Leeds')
            expect($tableCells.get(4)).to.contain('Staff Member')

            expect($tableCells.get(5)).to.contain('10 August 2017 - 16:04')
            expect($tableCells.get(6)).to.contain('Basic')
            expect($tableCells.get(7)).to.contain('Not entered')
            expect($tableCells.get(8)).to.contain('Moorland')
            expect($tableCells.get(9)).to.contain('Staff Member')

            expect($tableCells.get(10)).to.contain('7 August 2017 - 16:04')
            expect($tableCells.get(11)).to.contain('Enhanced')
            expect($tableCells.get(12)).to.contain('Not entered')
            expect($tableCells.get(13)).to.contain('Moorland')
            expect($tableCells.get(14)).to.contain('Another staff Member')
          })
      })
    })

    it('should filter correctly', () => {
      cy.task('stubIepSummaryForBooking', iepSummaryResponse)

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('[data-test="establishment-select"]').select('MDI')
      cy.get('[data-test="incentive-level-select"]').select('Basic')
      cy.get('[data-test="filter-submit"]').click()

      cy.get('[data-test="incentive-level-history"]').then(($table) => {
        cy.get($table)
          .find('td')
          .then(($tableCells) => {
            cy.get($tableCells).its('length').should('eq', 5) // 2 rows with 5 cells

            expect($tableCells.get(0)).to.contain('10 August 2017 - 16:04')
            expect($tableCells.get(1)).to.contain('Basic')
            expect($tableCells.get(2)).to.contain('Not entered')
            expect($tableCells.get(3)).to.contain('Moorland')
            expect($tableCells.get(4)).to.contain('Staff Member')
          })
      })
    })

    it('should show the default no incentive level history when there are no applied filters and no results', () => {
      cy.task('stubIepSummaryForBooking', {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        iepLevel: 'Standard',
        daysSinceReview: 625,
        iepDetails: [],
      })

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('[data-test="filter-submit"]').click()

      cy.get('h1').should('contain', title)
      cy.get('[data-test="incentive-level-history"]').should('not.exist')
      cy.get('[data-test="no-incentive-level-history-message"]').should(
        'contain',
        'John Smith has no incentive level history'
      )
    })

    it('should return default message when no incentive level history is returned for the supplied filters', () => {
      cy.task('stubIepSummaryForBooking', {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        iepLevel: 'Standard',
        daysSinceReview: 625,
        iepDetails: [],
      })

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('#fromDate').type('01/01/2020', { force: true })
      cy.get('[data-test="filter-submit"]').click()

      cy.get('h1').should('contain', title)
      cy.get('[data-test="incentive-level-history"]').should('not.exist')
      cy.get('[data-test="no-incentive-level-history-message"]').should(
        'contain',
        'There is no incentive level history for the selections you have made'
      )
    })
  })
})
