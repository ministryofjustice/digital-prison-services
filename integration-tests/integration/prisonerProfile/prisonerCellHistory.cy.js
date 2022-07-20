const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const PrisonerCellHistoryPage = require('../../pages/prisonerProfile/prisonerCellHistoryPage')

context('Prisoner cell history', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      // Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
              assignmentDate: '2020-05-01',
              assignmentDateTime: '2020-05-01T12:48:33.375',
              assignmentReason: 'ADM',
              bookingId: 123,
              description: 'MDI-1-02',
              livingUnitId: 1,
              movementMadeBy: 'STAFF_1',
            },
            {
              agencyId: 'MDI',
              assignmentDate: '2020-03-01',
              assignmentDateTime: '2020-03-01T12:48:33.375',
              assignmentEndDate: '2020-04-01',
              assignmentEndDateTime: '2020-04-01T12:48:33.375',
              assignmentReason: 'ADM',
              bookingId: 123,
              description: 'MDI-RECP',
              livingUnitId: 2,
              movementMadeBy: 'STAFF_2',
            },
            {
              agencyId: 'MDI',
              assignmentDate: '2020-04-01',
              assignmentDateTime: '2020-04-01T12:48:33.375',
              assignmentEndDate: '2020-05-01',
              assignmentEndDateTime: '2020-05-01T12:48:33.375',
              assignmentReason: 'ADM',
              bookingId: 123,
              description: 'MDI-1-03',
              livingUnitId: 3,
              movementMadeBy: 'STAFF_1',
            },
          ],
        },
      })
      cy.task('stubStaff', {
        staffId: 'STAFF_1',
        details: { firstName: 'Staff', lastName: 'One', username: 'STAFF_1' },
      })
      cy.task('stubStaff', {
        staffId: 'STAFF_2',
        details: { firstName: 'Staff', lastName: 'Two', username: 'STAFF_2' },
      })
    })

    it('should load the data correcly when one other occupant', () => {
      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.establishment().contains('Moorland')
      prisonerCellHistoryPage.location().contains('1-02')
      prisonerCellHistoryPage
        .currentLocationMovedInDate()
        .contains(moment('2020-05-01T12:48:33.375').format('DD/MM/YYYY - HH:mm'))
      prisonerCellHistoryPage.currentLocationMovedInBy().contains('Staff One')
      prisonerCellHistoryPage.occupants().contains('Offender, Test')
      prisonerCellHistoryPage.cellMoveButton().should('not.exist')
      prisonerCellHistoryPage
        .cellDetailsLink()
        .should('contain.text', 'View details for location 1-02')
        .should('have.attr', 'href')
        .and('contains', `/location-history?fromDate=2020-05-01T12:48:33&toDate=${moment().format('YYYY-MM-DDTHH:mm')}`)
        .and('contains', 'locationId=1&agencyId=MDI')
      prisonerCellHistoryPage.agencyHeading().contains('Moorland from 01/03/2020 to 01/05/2020')

      prisonerCellHistoryPage.results().then(($table) => {
        cy.get($table)
          .find('td')
          .then(($tableCells) => {
            cy.get($tableCells).its('length').should('eq', 10) // 2 rows with 5 cells

            expect($tableCells.get(0)).to.contain('1-03')
            expect($tableCells.get(1)).to.contain(moment('2020-04-01T12:48:33.375').format('DD/MM/YYYY - HH:mm'))
            expect($tableCells.get(2)).to.contain('Staff One')
            expect($tableCells.get(3)).to.contain(moment('2020-05-01T12:48:33.375').format('DD/MM/YYYY - HH:mm'))
            cy.get($tableCells.get(4))
              .find('a')
              .should('contain.text', 'View details for location 1-03')
              .should('have.attr', 'href')
              .and(
                'include',
                '/location-history?fromDate=2020-04-01T12:48:33&toDate=2020-05-01T12:48:33&locationId=3&agencyId=MDI'
              )
            expect($tableCells.get(5)).to.contain('Reception')
            expect($tableCells.get(6)).to.contain(moment('2020-03-01T12:48:33.375').format('DD/MM/YYYY - HH:mm'))
            expect($tableCells.get(7)).to.contain('Staff Two')
            expect($tableCells.get(8)).to.contain(moment('2020-04-01T12:48:33.375').format('DD/MM/YYYY - HH:mm'))
            expect($tableCells.get(9)).to.contain('')
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
      prisonerCellHistoryPage.occupants().should('not.exist')
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
      //  cy.clearCookies()
      //  cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_CELL_MOVE'] })
      cy.signIn()

      cy.visit(`/prisoner/${offenderNo}/cell-history`)
      const prisonerCellHistoryPage = PrisonerCellHistoryPage.verifyOnPage()
      prisonerCellHistoryPage.cellMoveButton().should('be.visible')
    })
  })
})
