const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const iepSummaryForBooking = {
  bookingId: -1,
  iepDate: '2017-08-15',
  iepTime: '2017-08-15T16:04:35',
  iepLevel: 'Standard',
  daysSinceReview: 625,
  nextReviewDate: '2018-08-15',
}

const prisonIncentiveLevels = [
  { levelCode: 'BAS', levelName: 'Basic', active: true, defaultOnAdmission: false },
  { levelCode: 'STD', levelName: 'Standard', active: true, defaultOnAdmission: true },
  { levelCode: 'ENH', levelName: 'Enhanced', active: true, defaultOnAdmission: false },
]

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
      cy.task('stubGetIepSummaryForBooking', iepSummaryForBooking)
      cy.task('stubGetPrisonIncentiveLevels', prisonIncentiveLevels)
      cy.task('stubChangeIepLevel', {})
    })

    it('should display the change incentive level link', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('h1').should('contain', 'Record John Smith’s incentive level')
      cy.get('[data-test="current-incentive-level"]').should('contain', 'Standard')
    })

    it('should submit the form and show confirmation', () => {
      cy.task('stubOffenderFullDetails', offenderFullDetails)
      cy.task('stubScenario', {
        scenarioName: 'changeIep',
        mappings: {
          // initial page load
          beforeSubmission: {
            request: {
              method: 'GET',
              urlPattern: '/incentives/iep/reviews/booking/[0-9]+?\\?.+?',
            },
            response: {
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
              },
              jsonBody: iepSummaryForBooking,
            },
          },
          // showing confirmation after `incentivesApi.changeIepLevel` is called
          afterSubmission: {
            request: {
              method: 'GET',
              urlPattern: '/incentives/iep/reviews/booking/[0-9]+?\\?.+?',
            },
            response: {
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
              },
              jsonBody: {
                ...iepSummaryForBooking,
                iepDate: '2021-09-26',
                iepTime: '2021-09-26T12:34:56',
                iepLevel: prisonIncentiveLevels[0].levelName,
                daysSinceReview: 0,
                nextReviewDate: '2022-09-26',
              },
            },
          },
        },
      })

      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="new-level"]')
        .find('[type="radio"]')
        .then(($radios) => {
          cy.get($radios).first().check()
        })
      cy.get('[data-test="change-reason"]').type('Test comment')
      cy.get('[data-test="submit-change').click()

      cy.get('[data-test="current-incentive-level"]').should('contain', 'Basic')
      cy.get('[data-test="next-review-date"]').should('contain', '26 September 2022')
    })

    context('should track clicks', () => {
      // add gtag (global function variable for Google Tag Manager) spy to page
      let gtagCalls = []
      const injectGtagSpy = () => {
        gtagCalls = []
        cy.window().then((win) => {
          // eslint-disable-next-line no-param-reassign
          win.gtag = (...args) => {
            gtagCalls.push(args)
          }
        })
      }
      const expectGtagEvent = (event_category) => {
        expect(gtagCalls).to.deep.equal([['event', 'click', { event_category, event_label: 'MDI' }]])
      }

      beforeEach(() => {
        cy.task('stubOffenderFullDetails', offenderFullDetails)
        cy.task('stubScenario', {
          scenarioName: 'changeIep',
          mappings: {
            // initial page load
            beforeSubmission: {
              request: {
                method: 'GET',
                urlPattern: '/incentives/iep/reviews/booking/[0-9]+?\\?.+?',
              },
              response: {
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                },
                jsonBody: iepSummaryForBooking,
              },
            },
            // showing confirmation after `incentivesApi.changeIepLevel` is called
            afterSubmission: {
              request: {
                method: 'GET',
                urlPattern: '/incentives/iep/reviews/booking/[0-9]+?\\?.+?',
              },
              response: {
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                },
                jsonBody: {
                  ...iepSummaryForBooking,
                  iepDate: '2021-09-26',
                  iepTime: '2021-09-26T12:34:56',
                  iepLevel: prisonIncentiveLevels[0].levelName,
                  daysSinceReview: 0,
                  nextReviewDate: '2022-09-26',
                },
              },
            },
          },
        })

        cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

        cy.get('[data-test="new-level"]')
          .find('[type="radio"]')
          .then(($radios) => {
            cy.get($radios).first().check()
          })
        cy.get('[data-test="change-reason"]').type('Test comment')
        cy.get('[data-test="submit-change').click()
        injectGtagSpy()
      })

      it('on manage incentive reviews button', () => {
        cy.get('[data-test="goto-manage-incentives"]')
          .click()
          .then(() => {
            expectGtagEvent('Record incentive level confirmation: manage reviews')
          })
      })

      it('on prisoner profile button', () => {
        cy.get('[data-test="goto-prisoner-quicklook"]')
          .click()
          .then(() => {
            expectGtagEvent('Record incentive level confirmation: case notes')
          })
      })
    })

    it('should display missing input form errors', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="submit-change').click()

      cy.get('[data-test="form-errors"]')
        .find('li')
        .then(($errors) => {
          expect($errors.get(0)).to.contain('Select an incentive level, even if it is the same as before')
          expect($errors.get(1)).to.contain('Enter a reason for recording')
        })
    })

    it('should display max reason length form error', () => {
      cy.visit(`/prisoner/${offenderNo}/incentive-level-details/change-incentive-level`)

      cy.get('[data-test="change-reason"]').type('Test comment. '.repeat(18))
      cy.get('[data-test="submit-change').click()

      cy.get('[data-test="form-errors"]')
        .find('li')
        .then(($errors) => {
          expect($errors.get(1)).to.contain('Comments must be 240 characters or less')
        })
    })
  })
})
