const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const PrisonerCellHistoryPage = require('../../pages/prisonerProfile/prisonerCellHistoryPage')

context('Prisoner cell history', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubUserMeRoles', [])
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
      cy.task('stubAgencyDetails', { agencyId: 'MDI', details: { agencyId: 'MDI', description: 'Moorland' } })
      cy.task('stubInmatesAtLocation', {
        inmates: [{ offenderNo: 'A1235A', firstName: 'Test', lastName: 'Offender' }],
      })
      cy.task('stubOffenderCellHistory', {
        history: {
          content: [
            {
              agencyId: 'MDI',
              assignmentDate: '2020-09-01',
              assignmentDateTime: '2020-09-01T12:48:33.375Z',
              assignmentReason: 'ADM',
              bookingId: 123,
              description: 'MDI-1-02',
              livingUnitId: 1,
            },
            {
              agencyId: 'MDI',
              assignmentDate: '2020-08-01',
              assignmentDateTime: '2020-08-01T12:48:33.375Z',
              assignmentEndDate: '2020-09-01',
              assignmentEndDateTime: '2020-09-01T12:48:33.375Z',
              assignmentReason: 'ADM',
              bookingId: 123,
              description: 'MDI-1-03',
              livingUnitId: 3,
            },
          ],
        },
      })
    })

    it('should load the data correcly when one other occupant', () => {
      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.establishment().contains('Moorland')
      prisonerCellHistoryPage.location().contains('1-02')
      prisonerCellHistoryPage.occupants().contains('Offender, Test')
      prisonerCellHistoryPage.cellMoveButton().should('not.be.visible')
      prisonerCellHistoryPage
        .cellDetailsLink()
        .should('have.attr', 'href')
        .and(
          'include',
          `/location-history?fromDate=2020-09-01T12:48:33&toDate=${moment().format(
            'YYYY-MM-DDTHH:mm:ss'
          )}&locationId=1&agencyId=MDI`
        )

      prisonerCellHistoryPage.results().then($table => {
        cy.get($table)
          .find('td')
          .then($tableCells => {
            cy.get($tableCells)
              .its('length')
              .should('eq', 5) // 1 row with 5 cells

            expect($tableCells.get(0)).to.contain('Moorland')
            expect($tableCells.get(1)).to.contain('1-03')
            expect($tableCells.get(2)).to.contain(moment('2020-08-01T12:48:33.375Z').format('DD/MM/YYYY - HH:mm'))
            expect($tableCells.get(3)).to.contain(moment('2020-09-01T12:48:33.375Z').format('DD/MM/YYYY - HH:mm'))
            cy.get($tableCells.get(4))
              .find('a')
              .should('have.attr', 'href')
              .and(
                'include',
                '/location-history?fromDate=2020-08-01T12:48:33&toDate=2020-09-01T12:48:33&locationId=3&agencyId=MDI'
              )
          })
      })
    })

    it('should load the data correcly when no occupants', () => {
      cy.task('stubInmatesAtLocation', {
        inmates: [],
      })
      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.establishment().contains('Moorland')
      prisonerCellHistoryPage.location().contains('1-02')
      prisonerCellHistoryPage.occupants().should('not.be.visible')
    })

    it('should load the data correcly when multiple other occupants', () => {
      cy.task('stubInmatesAtLocation', {
        inmates: [
          { offenderNo: 'A1235A', firstName: 'Test', lastName: 'Offender' },
          { offenderNo: 'A1235C', firstName: 'Test2', lastName: 'Offender2' },
        ],
      })
      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.establishment().contains('Moorland')
      prisonerCellHistoryPage.location().contains('1-02')
      prisonerCellHistoryPage.occupants().contains('Offender, Test')
      prisonerCellHistoryPage.occupants().contains('Offender2, Test2')
    })

    it('should show the cell move button when correct role is present', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'CELL_MOVE' }])
      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.cellMoveButton().should('be.visible')
    })
  })
})
