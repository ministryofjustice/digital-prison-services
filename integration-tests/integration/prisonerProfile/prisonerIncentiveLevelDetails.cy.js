import moment from 'moment'

const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

const title = 'Incentive level details for John Smith'

const iepSummaryResponse = {
  bookingId: -1,
  iepDate: '2017-08-15',
  iepTime: '2017-08-15T16:04:35',
  iepLevel: 'Standard',
  daysSinceReview: 625,
  nextReviewDate: '2018-08-15',
  iepDetails: [
    {
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      agencyId: 'LEI',
      iepLevel: 'Standard',
      userId: 'INCENTIVES_API',
      comments: 'Comment 3',
    },
    {
      bookingId: -1,
      iepDate: '2017-08-10',
      iepTime: '2017-08-10T16:04:35',
      agencyId: 'MDI',
      iepLevel: 'Basic',
      userId: 'ITAG_USER',
      comments: 'Comment 2',
    },
    {
      bookingId: -1,
      iepDate: '2017-08-07',
      iepTime: '2017-08-07T16:04:35',
      agencyId: 'MDI',
      iepLevel: 'Enhanced',
      userId: 'ITAG_USER_2',
      comments: 'Comment 1',
    },
  ],
}
const offenderNo = 'A1234A'

context('Prisoner incentive level details', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      roles: ['ROLE_GLOBAL_SEARCH', 'ROLE_MAINTAIN_IEP'],
    })
    cy.signIn()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
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
      cy.task('stubGetIepSummaryForBooking', iepSummaryResponse)

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('h1').should('contain', title)
      cy.get('[data-test="change-incentive-level-link"]')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/prisoner/A1234A/incentive-level-details/change-incentive-level')
        })
    })

    context('Next review date', () => {
      it('should show when next review date is', () => {
        // pretend the last review was 10 days ago
        const lastReviewDate = moment().subtract(10, 'days')
        const nextReviewDate = lastReviewDate.clone().add(1, 'year')

        cy.task('stubGetIepSummaryForBooking', {
          ...iepSummaryResponse,
          iepDate: lastReviewDate.format('YYYY-MM-DD'),
          iepTime: lastReviewDate.format('YYYY-MM-DDTHH:mm:ss'),
          nextReviewDate: nextReviewDate.format('YYYY-MM-DD'),
        })

        cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

        cy.get('[data-test="next-review-date"]').should('contain', nextReviewDate.format('D MMMM YYYY'))
        cy.get('[data-test="next-review-overdue"]').should('not.exist')
      })

      it('should also show if next review is overdue', () => {
        // pretend the last review was 400 days ago
        const lastReviewDate = moment().subtract(400, 'days')
        const nextReviewDate = lastReviewDate.clone().add(1, 'year')

        cy.task('stubGetIepSummaryForBooking', {
          ...iepSummaryResponse,
          iepDate: lastReviewDate.format('YYYY-MM-DD'),
          iepTime: lastReviewDate.format('YYYY-MM-DDTHH:mm:ss'),
          nextReviewDate: nextReviewDate.format('YYYY-MM-DD'),
        })

        cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

        cy.get('[data-test="next-review-date"]').should('contain', nextReviewDate.format('D MMMM YYYY'))
        cy.get('[data-test="next-review-overdue"]').should('contain', '35 days overdue')
      })
    })

    it('should show correct history', () => {
      // pretend the last review was 400 days ago
      const lastReviewDate = moment().subtract(400, 'days')
      const nextReviewDate = lastReviewDate.clone().add(1, 'year')
      cy.task('stubGetIepSummaryForBooking', {
        ...iepSummaryResponse,
        iepDate: lastReviewDate.format('YYYY-MM-DD'),
        iepTime: lastReviewDate.format('YYYY-MM-DDTHH:mm:ss'),
        nextReviewDate: nextReviewDate.format('YYYY-MM-DD'),
      })

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

      cy.get('[data-test="incentive-level-history"]').then(($table) => {
        cy.get($table)
          .find('td')
          .then(($tableCells) => {
            cy.get($tableCells).its('length').should('eq', 15) // 2 rows with 5 cells

            expect($tableCells.get(0)).to.contain('15 August 2017 - 16:04')
            expect($tableCells.get(1)).to.contain('Standard')
            expect($tableCells.get(2)).to.contain('Comment 3')
            expect($tableCells.get(3)).to.contain('Leeds')
            expect($tableCells.get(4)).to.contain('System')

            expect($tableCells.get(5)).to.contain('10 August 2017 - 16:04')
            expect($tableCells.get(6)).to.contain('Basic')
            expect($tableCells.get(7)).to.contain('Comment 2')
            expect($tableCells.get(8)).to.contain('Moorland')
            expect($tableCells.get(9)).to.contain('Staff Member')

            expect($tableCells.get(10)).to.contain('7 August 2017 - 16:04')
            expect($tableCells.get(11)).to.contain('Enhanced')
            expect($tableCells.get(12)).to.contain('Comment 1')
            expect($tableCells.get(13)).to.contain('Moorland')
            expect($tableCells.get(14)).to.contain('Another staff Member')
          })
      })
    })

    it('should filter correctly', () => {
      cy.task('stubGetIepSummaryForBooking', iepSummaryResponse)

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
            expect($tableCells.get(2)).to.contain('Comment 2')
            expect($tableCells.get(3)).to.contain('Moorland')
            expect($tableCells.get(4)).to.contain('Staff Member')
          })
      })
    })

    it('should show the default no incentive level history when there are no applied filters and no results', () => {
      cy.task('stubGetIepSummaryForBooking', {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        iepLevel: 'Standard',
        daysSinceReview: 625,
        nextReviewDate: '2018-08-15',
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
      cy.task('stubGetIepSummaryForBooking', {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        iepLevel: 'Standard',
        daysSinceReview: 625,
        nextReviewDate: '2018-08-15',
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

context('without permissions', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      roles: ['ROLE_GLOBAL_SEARCH'],
    })
    cy.signIn()
  })

  beforeEach(() => {
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
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

  it('should not show change incentive level link if user does not have correct role', () => {
    cy.task('stubGetIepSummaryForBooking', iepSummaryResponse)

    cy.visit(`/prisoner/${offenderNo}/incentive-level-details`)

    cy.get('[data-test="change-incentive-level-link"]').should('not.exist')
  })
})
