const PrisonerAlertsPage = require('../../pages/prisonerProfile/prisonerAlertsPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { assertHasRequestCount } = require('../assertions')

context('A user can view alerts for a prisoner', () => {
  const inactiveAlerts = [
    {
      active: false,
      addedByFirstName: 'John',
      addedByLastName: 'Smith',
      alertCode: 'XC',
      alertCodeDescription: 'Risk to females',
      alertId: 1,
      alertType: 'X',
      alertTypeDescription: 'Security',
      bookingId: 14,
      comment: 'has a large poster on cell wall',
      dateCreated: '2019-08-20',
      dateExpires: null,
      expired: true,
      expiredByFirstName: 'John',
      expiredByLastName: 'Smith',
      offenderNo: 'G3878UK',
    },
  ]

  const activeAlerts = [
    {
      active: true,
      addedByFirstName: 'John',
      addedByLastName: 'Smith',
      alertCode: 'XC',
      alertCodeDescription: 'Risk to females',
      alertId: 1,
      alertType: 'X',
      alertTypeDescription: 'Security',
      bookingId: 14,
      comment: 'has a large poster on cell wall',
      dateCreated: '2019-08-20',
      dateExpires: null,
      expired: false,
      expiredByFirstName: 'John',
      expiredByLastName: 'Smith',
      offenderNo: 'G3878UK',
    },
  ]

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('When a prisoner is in a users caseload', () => {
    beforeEach(() => {
      // Maintain session between the two tests.
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      const iepSummary = {}
      const caseNoteSummary = {}
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'MDI' },
        iepSummary,
        caseNoteSummary,
        offenderNo: 'A12345',
      })
      cy.task('stubAlertTypes')
      cy.task('stubPathFinderOffenderDetails', null)
      cy.task('stubClientCredentialsRequest')
    })

    it('Users can view inactive alerts', () => {
      cy.task('stubAlertsForBooking', inactiveAlerts)
      cy.visit('/prisoner/G3878UK/alerts')
      cy.task('verifyAlertsBooking', {
        bookingId: 14,
        alertType: '',
        from: '',
        to: '',
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,desc',
        size: 20,
      }).then(assertHasRequestCount(1))

      const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
      const filterForm = prisonerAlertsPage.getFilterForm()
      filterForm.activeFilter().select('INACTIVE')
      filterForm.applyButton().click()
      prisonerAlertsPage.tableTitle().contains('Inactive alerts')

      const inactiveTable = prisonerAlertsPage.getInactiveAlertsRows(0)
      inactiveTable.typeOfAlert().contains('Security (X)')
      inactiveTable.details().contains('Risk to females (XC)')
      inactiveTable.comments().contains('has a large poster on cell wall')
      inactiveTable.dateFromDateClosed().contains('20 August 2019')
      inactiveTable.createdByClosedBy().contains('John Smith')
      cy.get('[data-test="inactive-create-alerts-link"]').should('contain.text', 'Create an alert')
    })
    it('Users can filter alerts', () => {
      cy.task('stubAlertsForBooking', inactiveAlerts)
      cy.visit('/prisoner/G3878UK/alerts')

      const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
      const filterForm = prisonerAlertsPage.getFilterForm()
      filterForm.activeFilter().select('INACTIVE')
      filterForm.typeFilter().select('Medical')
      filterForm.fromFilter().type('05/08/2020', { force: true }).type('{esc}', { force: true })
      filterForm.toFilter().type('30/11/2020', { force: true }).type('{esc}', { force: true })
      filterForm.applyButton().click()

      cy.task('verifyAlertsBooking', {
        bookingId: 14,
        alertType: 'M',
        from: '2020-08-05',
        to: '2020-11-30',
        alertStatus: 'INACTIVE',
        page: 0,
        sort: 'dateCreated,desc',
        size: 20,
      }).then(assertHasRequestCount(1))
      PrisonerAlertsPage.verifyOnPage('Smith, John')
    })

    it('Users can view active alerts', () => {
      cy.task('stubAlertsForBooking', activeAlerts)
      cy.visit('/prisoner/G3878UK/alerts')
      const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
      const activeTable = prisonerAlertsPage.getActiveAlertsRows(0)

      prisonerAlertsPage.tableTitle().contains('Active alerts')
      activeTable.typeOfAlert().contains('Security (X)')
      activeTable.alert().contains('Risk to females (XC)')
      activeTable.comments().contains('has a large poster on cell wall')
      activeTable.dateFrom().contains('20 August 2019')
      activeTable.createdBy().contains('John Smith')
      activeTable.editCreateButton().find('a').contains('Change or close')
      cy.get('[data-test="active-create-alerts-link"]').should('contain.text', 'Create an alert')
    })

    it('Users can view create alert button when none of type', () => {
      cy.task('stubAlertsForBooking')
      cy.visit('/prisoner/G3878UK/alerts')

      cy.get('[data-test="no-alerts"]').should('contain.text', 'There are no alerts of this type')
      cy.get('[data-test="no-alerts-link"]').should('be.visible')
    })
  })

  context('When a prisoner is NOT in a users caseload', () => {
    beforeEach(() => {
      // Maintain session between the two tests.
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      const iepSummary = {}
      const caseNoteSummary = {}
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary,
        caseNoteSummary,
        offenderNo: 'A12345',
      })
      cy.task('stubAlertTypes')
      cy.task('stubPathFinderOffenderDetails', null)
      cy.task('stubClientCredentialsRequest')
    })

    it('Users should not be able to see create alert for inactive alerts display', () => {
      cy.task('stubAlertsForBooking', inactiveAlerts)
      cy.visit('/prisoner/G3878UK/alerts')

      cy.get('[data-test="inactive-create-alerts-link"]').should('not.exist')
    })

    it('Users should not be able to see Create or Edit / close buttons for active alerts display', () => {
      cy.task('stubAlertsForBooking', activeAlerts)
      cy.visit('/prisoner/G3878UK/alerts')

      const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
      const activeTable = prisonerAlertsPage.getActiveAlertsRows(0)

      activeTable.editCreateButton().find('a').should('not.exist')
      cy.get('[data-test="active-create-alerts-link"]').should('not.exist')
    })

    it('Should show a message if there are no alerts to display', () => {
      cy.task('stubAlertsForBooking')
      cy.visit('/prisoner/G3878UK/alerts')

      cy.get('[data-test="no-alerts"]').should('contain.text', 'There are no alerts of this type')
      cy.get('[data-test="no-alerts-link"]').should('not.exist')
    })
  })
})
