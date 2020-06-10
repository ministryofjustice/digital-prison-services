const DashboardPage = require('../../pages/covid/dashboardPage')

const alert = val => ({ alerts: { equalTo: val } })

context('A user can view the covid dashboard page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()

    cy.task('stubInmates', { locationId: 'MDI', params: {}, count: 102 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('UPIU'), count: 8 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('URCU'), count: 12 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('USU'), count: 14 })
    cy.task('stubInmates', { locationId: 'MDI', params: alert('URS'), count: 5 })
  })

  it('A user can view the covid dashboard', () => {
    const dashboardPage = DashboardPage.goTo()

    dashboardPage.prisonPopulation().contains(102)
    dashboardPage.reverseCohortingUnit().contains(12)
    dashboardPage.protectiveIsolationUnit().contains(8)
    dashboardPage.shieldingUnit().contains(14)
    dashboardPage.refusingToShield().contains('There are 5 prisoners who are refusing to shield')
  })
})
