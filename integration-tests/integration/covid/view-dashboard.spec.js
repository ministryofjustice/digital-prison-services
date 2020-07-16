const moment = require('moment')
const DashboardPage = require('../../pages/covid/dashboardPage')
const ReverseCohortingUnitPage = require('../../pages/covid/reverseCohortingUnitPage')
const NotInUnitPage = require('../../pages/covid/notInUnitPage')
const ProtectiveIsolationUnitPage = require('../../pages/covid/protectiveIsolationUnitPage')
const ShieldingUnitPage = require('../../pages/covid/shieldingUnitPage')
const RefusingToShieldPage = require('../../pages/covid/refusingToShieldPage')

const alert = val => ({ alerts: { equalTo: val } })

context('Covid dashboard page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()

    cy.task('stubAlerts', { locationId: 'MDI', alerts: [] })

    cy.task('stubInmates', { locationId: 'MDI', params: {}, count: 102 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('UPIU'), count: 8 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('URCU'), count: 12 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('USU'), count: 14 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('URS'), count: 5 })

    cy.task('stubMovementsBetween', {
      locationId: 'MDI',
      fromDate: moment()
        .startOf('day')
        .subtract(14, 'days')
        .format('YYYY-MM-DDTHH:mm:ss'),
      movements: [
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          location: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
          movementDateTime: '2020-01-04',
        },
        {
          offenderNo: 'CC1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'BOB',
          lastName: 'SMITH',
          movementDateTime: '2020-01-05',
        },
        {
          offenderNo: 'DD1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'JIM',
          lastName: 'SMITH',
          movementDateTime: '2020-01-05',
        },
      ],
    })
  })

  it('A user can view the covid dashboard', () => {
    const dashboardPage = DashboardPage.goTo()

    dashboardPage.prisonPopulation().contains(102)

    dashboardPage.reverseCohortingUnit().contains(12)
    dashboardPage.reverseCohortingUnitLink().should('be.visible')

    dashboardPage.notInUnit().contains(3)
    dashboardPage.notInUnitLink().should('be.visible')

    dashboardPage.protectiveIsolationUnit().contains(8)
    dashboardPage.protectiveIsolationUnitLink().should('be.visible')

    dashboardPage.shieldingUnit().contains(14)
    dashboardPage.shieldingUnitLink().should('be.visible')

    dashboardPage.refusingToShield().contains('There are 5 prisoners who are refusing to shield')
    dashboardPage.refusingToShieldLink().should('be.visible')
  })

  it('A user can navigate to the reverse cohorting unit', () => {
    DashboardPage.goTo()
      .reverseCohortingUnitLink()
      .click()

    ReverseCohortingUnitPage.verifyOnPage()
  })

  it('A user can navigate to the not in unit page', () => {
    DashboardPage.goTo()
      .notInUnitLink()
      .click()

    NotInUnitPage.verifyOnPage()
  })

  it('A user can navigate to the protective isolation unit', () => {
    DashboardPage.goTo()
      .protectiveIsolationUnitLink()
      .click()

    ProtectiveIsolationUnitPage.verifyOnPage()
  })

  it('A user can navigate to the shielding unit', () => {
    DashboardPage.goTo()
      .shieldingUnitLink()
      .click()

    ShieldingUnitPage.verifyOnPage()
  })

  it('A user can navigate to the refusing to shield list', () => {
    DashboardPage.goTo()
      .refusingToShieldLink()
      .click()

    RefusingToShieldPage.verifyOnPage()
  })
})
