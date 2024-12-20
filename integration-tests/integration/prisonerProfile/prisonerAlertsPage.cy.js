const PrisonerAlertsPage = require('../../pages/prisonerProfile/prisonerAlertsPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { assertHasRequestCount } = require('../assertions')

context('A user can view alerts for a prisoner', () => {
  const inactiveAlerts = [
    {
      isActive: false,
      createdByDisplayName: 'John Smith',
      alertCode: { code: 'XC', description: 'Risk to females', alertTypeCode: 'X', alertTypeDescription: 'Security' },
      alertId: 1,
      bookingId: 14,
      description: 'has a large poster on cell wall',
      createdAt: '2019-08-20',
      activeTo: '2019-08-21',
      expired: true,
      activeToLastSetByDisplayName: 'John Smith',
      prisonNumber: 'G3878UK',
    },
  ]

  const activeAlerts = [
    {
      isActive: true,
      createdByDisplayName: 'John Smith',
      alertCode: { code: 'XC', description: 'Risk to females', alertTypeCode: 'X', alertTypeDescription: 'Security' },
      alertId: 1,
      bookingId: 14,
      description: 'has a large poster on cell wall',
      createdAt: '2019-08-20',
      activeTo: null,
      expired: false,
      activeToLastSetByDisplayName: 'John Smith',
      prisonNumber: 'G3878UK',
    },
  ]

  beforeEach(() => {
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_UPDATE_ALERT'] })
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.signIn()
    })
  })

  context('When a prisoner is in a users caseload', () => {
    beforeEach(() => {
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
