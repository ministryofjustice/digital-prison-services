const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Prisoner change incentive level details', () => {
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
      cy.task('stubIepSummaryForBooking', {
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
      })
      cy.task('stubGetAgencyIepLevels', [
        { iepLevel: 'ENT', iepDescription: 'Entry' },
        { iepLevel: 'BAS', iepDescription: 'Basic' },
        { iepLevel: 'STD', iepDescription: 'Standard' },
        { iepLevel: 'ENH', iepDescription: 'Enhanced' },
      ])
      cy.task('stubChangeIepLevel', {})
    })

    it('should display the change incentive level link', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('h1').should('contain', 'Select John Smith’s incentive level')
      cy.get('[data-test="current-incentive-level"]').should('contain', 'Standard')
    })

    it('should submit the form and redirect', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="new-level"]')
        .find('[type="radio"]')
        .then(($radios) => {
          cy.get($radios).first().check()
        })
      cy.get('[data-test="change-reason"]').type('Test comment')
      cy.get('[data-test="submit-change').click()
      cy.location('pathname').should('eq', '/prisoner/A1234A/incentive-level-details')
    })

    it('should display missing input form errors', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="submit-change').click()

      cy.get('[data-test="form-errors"]')
        .find('li')
        .then(($errors) => {
          expect($errors.get(0)).to.contain('Select an incentive level')
          expect($errors.get(1)).to.contain('Enter a reason for your selected incentive label')
        })
    })

    it('should display max reason length form error', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="change-reason"]').type('Test comment. '.repeat(18))
      cy.get('[data-test="submit-change').click()

      cy.get('[data-test="form-errors"]')
        .find('li')
        .then(($errors) => {
          expect($errors.get(1)).to.contain('The reason must be 240 characters or less')
        })
    })
  })
})
