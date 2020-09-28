const moment = require('moment')
const { getCurrentPeriod } = require('../../../backend/utils')
const searchPage = require('../../pages/whereabouts/searchPage')

context('Whereabouts search page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.task('stubLocationGroups')
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

    cy.login()
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

  it('should show error on activity locations api error', () => {
    const page = searchPage.goTo()

    page.period().then(() => {
      cy.task('stubActivityLocationsByDateAndPeriod', {
        locations: [
          {
            locationId: 6,
            userDescription: 'loc6',
          },
        ],
        date: moment().format('YYYY-MM-DD'),
        period: 'ED',
        withFault: true,
      })

      cy.server()
      cy.route({
        method: 'GET',
        url: `/api/activityLocations?agencyId=MDI&bookedOnDay=${moment().format('DD/MM/YYYY')}&timeSlot=ED`,
      }).as('stubActivityLocationsByDateAndPeriod')

      page.period().select('ED')

      cy.wait('@stubActivityLocationsByDateAndPeriod').then(() => {
        cy.get('.error-message').contains(
          'Something went wrong: Error: this page cannot be loaded. You can try to refresh your browser.'
        )
      })
    })
  })
})
