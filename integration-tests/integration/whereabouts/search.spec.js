const moment = require('moment')
const { getCurrentPeriod } = require('../../../backend/utils')
const searchPage = require('../../pages/whereabouts/searchPage')

const caseload = 'MDI'

context('Whereabouts search page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubLocationGroups')
    cy.task('stubGroups', caseload)
    cy.task('stubActivityLocationsByDateAndPeriod', {
      locations: [
        {
          locationId: 1,
          userDescription: 'loc1',
        },
        {
          locationId: 2,
          userDescription: 'loc2',
        },
        {
          locationId: 3,
          userDescription: 'loc3',
        },
      ],
      date: moment().format('YYYY-MM-DD'),
      period: getCurrentPeriod(moment()),
    })
  })

  it('should load the page without error', () => {
    const page = searchPage.goTo()

    page.checkStillOnPage()
  })

  it('should validate the presence of either an activity or a location', () => {
    const page = searchPage.goTo()

    page.continueActivityButton().click()

    page.checkStillOnPage()

    page.validationMessage().contains('Please select location or activity')
  })

  it('should update the activity list when selecting a date', () => {
    const page = searchPage.goTo()

    page.period().then($period => {
      const lastYear = moment()
        .subtract(1, 'year')
        .year()

      const date = `${lastYear}-08-01`
      const period = $period.val()

      cy.server()
      cy.route({
        method: 'GET',
        url: `/api/activityLocations?agencyId=MDI&bookedOnDay=01/08/${lastYear}&timeSlot=${period}`,
      }).as('stubActivityLocationsByDateAndPeriod')

      cy.task('stubActivityLocationsByDateAndPeriod', {
        locations: [
          {
            locationId: 5,
            userDescription: 'loc5',
          },
        ],
        date,
        period,
      })

      page.datePicker().click()
      page.datePickerTopBar().click()
      page.datePickerTopBar().click()
      page.getPickerYearSelector(lastYear).click()
      page.getPickerMonthSelector('Aug').click()
      page.getPickerDaySelector('1').click()

      cy.wait('@stubActivityLocationsByDateAndPeriod').then(() => {
        page.activity().contains('loc5')
      })
    })
  })

  it('should update the activity list when selecting a period', () => {
    const page = searchPage.goTo()

    page.period().then(() => {
      cy.server()
      cy.route({
        method: 'GET',
        url: `/api/activityLocations?agencyId=MDI&bookedOnDay=${moment().format('DD/MM/YYYY')}&timeSlot=PM`,
      }).as('stubActivityLocationsByDateAndPeriod')

      cy.task('stubActivityLocationsByDateAndPeriod', {
        locations: [
          {
            locationId: 6,
            userDescription: 'loc6',
          },
        ],
        date: moment().format('YYYY-MM-DD'),
        period: 'PM',
      })

      page.period().select('PM')

      cy.wait('@stubActivityLocationsByDateAndPeriod').then(() => {
        page.activity().contains('loc6')
      })
    })
  })
})

context('Whereabouts search page fault handling', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubLocationGroups')
    cy.task('stubGroups', caseload)
  })

  it('should show error on activity locations api error', () => {
    cy.task('stubActivityLocationsConnectionResetFault')
    cy.server()
    cy.route({
      method: 'GET',
      url: `/api/activityLocations?agencyId=MDI&bookedOnDay=${moment().format(
        'DD/MM/YYYY'
      )}&timeSlot=${getCurrentPeriod(moment())}`,
    }).as('stubActivityLocationsByDateAndPeriod')

    const page = searchPage.goTo()

    cy.wait('@stubActivityLocationsByDateAndPeriod').then(() => {
      page
        .errorMessage()
        .contains('Something went wrong: Error: The page is having trouble loading. Try refreshing the browser.')
    })
  })
})
