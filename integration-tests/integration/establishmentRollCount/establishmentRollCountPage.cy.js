const moment = require('moment')

context('A user can see the data in the dashbaord', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserMe', {})
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
    cy.task('stubLocationsForAgency', {
      agency: 'MDI',
      locations: [
        { description: '1-1', locationId: 1 },
        { description: 'CSWAP', locationId: 2 },
      ],
    })
    cy.task('stubAttributesForLocation', { noOfOccupants: 3 })
  })

  it('should load the page with the correct data', () => {
    cy.visit('/establishment-roll')

    cy.get('h1').should('contain', `Establishment roll for ${moment().format('dddd D MMMM YYYY')}`)
    cy.get('[data-test="unlock-roll"]').should('contain', '329')
    cy.get('[data-test="in-today"]').should('contain', '1')
    cy.get('[data-test="out-today"]').should('contain', '2')
    cy.get('[data-test="current-roll"]').should('contain', '3')
    cy.get('[data-test="unassigned-in"]').should('contain', '2')
    cy.get('[data-test="enroute"]').should('contain', '6')
    cy.get('[data-test="no-cell-allocated"]').should('contain', '3')

    cy.get('[data-test="establishment-roll-table"]').then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 3)
          expect($tableRows.get(0).innerText).to.contain('Houseblock 1\t156\t154\t2\t170\t14\t0')
          expect($tableRows.get(1).innerText).to.contain('Houseblock 2\t172\t172\t0\t180\t8\t1')
          expect($tableRows.get(2).innerText).to.contain('Moorland\t328\t326\t2\t350\t22\t1')
        })
    })
  })
})
