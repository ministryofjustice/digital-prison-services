const EstablishmentRollCountPage = require('../../pages/establishmentRollCount/establishmentRollCountPage')

context('A user can see the data in the dashbaord', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubUserMeRoles', [])
    cy.task('stubUserMe')
    cy.task('stubUserCaseLoads')
    cy.task('stubEstablishmentRollCount', {
      agencyId: 'MDI',
      assignedMovements: [
        {
          livingUnitId: 0,
          livingUnitDesc: 'HOUSEBLOCK 1',
          bedsInUse: 156,
          currentlyInCell: 154,
          currentlyOut: 2,
          operationalCapacity: 170,
          netVacancies: 14,
          maximumCapacity: 0,
          availablePhysical: 0,
          outOfOrder: 0,
        },
        {
          livingUnitId: 0,
          livingUnitDesc: 'HOUSEBLOCK 2',
          bedsInUse: 172,
          currentlyInCell: 172,
          currentlyOut: 0,
          operationalCapacity: 180,
          netVacancies: 8,
          maximumCapacity: 0,
          availablePhysical: 0,
          outOfOrder: 1,
        },
      ],
      unassignedMovements: [
        {
          livingUnitId: 0,
          livingUnitDesc: 'Reception',
          bedsInUse: 0,
          currentlyInCell: 2,
          currentlyOut: 2,
          operationalCapacity: 10,
          netVacancies: 12,
          maximumCapacity: 0,
          availablePhysical: 0,
          outOfOrder: 0,
        },
      ],
      movements: {
        in: 1,
        out: 2,
      },
      enroute: 6,
    })
  })

  it('should page with the correct offender name and cell description', () => {
    cy.visit('/establishment-roll')
    const establishmentRollCountPage = EstablishmentRollCountPage.verifyOnPage()
    establishmentRollCountPage.values().then($values => {
      cy.get($values)
        .its('length')
        .should('eq', 24)
      expect($values.get(0)).to.contain('329')
      expect($values.get(1)).to.contain('1')
      expect($values.get(2)).to.contain('2')
      expect($values.get(3)).to.contain('328')
      expect($values.get(4)).to.contain('2')
      expect($values.get(5)).to.contain('6')
      expect($values.get(6)).to.contain('156')
      expect($values.get(7)).to.contain('154')
      expect($values.get(8)).to.contain('2')
      expect($values.get(9)).to.contain('170')
      expect($values.get(10)).to.contain('14')
      expect($values.get(11)).to.contain('0')
      expect($values.get(12)).to.contain('172')
      expect($values.get(13)).to.contain('172')
      expect($values.get(14)).to.contain('0')
      expect($values.get(15)).to.contain('180')
      expect($values.get(16)).to.contain('8')
      expect($values.get(17)).to.contain('1')
      expect($values.get(18)).to.contain('328')
      expect($values.get(19)).to.contain('326')
      expect($values.get(20)).to.contain('2')
      expect($values.get(21)).to.contain('350')
      expect($values.get(22)).to.contain('22')
      expect($values.get(23)).to.contain('1')
    })
  })
})
