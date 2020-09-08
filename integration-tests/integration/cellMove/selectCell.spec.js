const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SelectCellPage = require('../../pages/cellMove/selectCellPage')

const offenderNo = 'A12345'

context('A user can select a cell', () => {
  const assertRow = (
    rowIndex,
    columns,
    { location, cellType, capacity, spaces, occupier, csra, relevantAlerts, selectCell }
  ) => {
    const index = rowIndex * 8

    expect(columns[index].innerText).to.contain(location)
    expect(columns[index + 1].innerText).to.contain(cellType)
    expect(columns[index + 2].innerText).to.contain(capacity)
    expect(columns[index + 3].innerText).to.contain(spaces)
    expect(columns[index + 4].innerText).to.contain(occupier)
    expect(columns[index + 5].innerText).to.contain(csra)
    expect(columns[index + 6].innerText).to.contain(relevantAlerts)
    expect(columns[index + 7].innerText).to.contain(selectCell)
  }
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubBookingNonAssociations', {})
    cy.task('stubGroups', { id: 'MDI' })
    cy.task('stubCellAttributes')
    cy.task('stubInmatesAtLocation', {
      inmates: [{ offenderNo: 'A12345', firstName: 'Bob', lastName: 'Doe', assignedLivingUnitId: 1 }],
    })
    cy.task('stubGetAlerts', { agencyId: 'MDI', alerts: [{ offenderNo: 'A12345', alertCode: 'PEEP' }] })
    cy.task('stubCsraAssessments', {
      offenderNumbers: ['A12345'],
      assessments: [
        {
          offenderNo: 'A12345',
          assessmentCode: 'CSRA',
          assessmentComment: 'test',
          assessmentDate: '2020-01-10',
          classification: 'Standard',
        },
      ],
    })
  })

  context('with cell data', () => {
    beforeEach(() => {
      cy.task('stubCellsWithCapacity', {
        cells: [
          {
            attributes: [{ description: 'Special Cell', code: 'SPC' }, { description: 'Gated Cell', code: 'GC' }],
            capacity: 2,
            description: 'LEI-1-2',
            id: 1,
            noOfOccupants: 2,
            userDescription: 'LEI-1-1',
          },
          {
            attributes: [{ code: 'LC', description: 'Listener Cell' }],
            capacity: 3,
            description: 'LEI-1-1',
            id: 1,
            noOfOccupants: 2,
            userDescription: 'LEI-1-1',
          },
        ],
      })
    })

    it('should load without error', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.checkStillOnPage()
    })

    it('should display the correct cell information', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.cellResults().then($table => {
        cy.get($table)
          .find('tr')
          .then($tableRows => {
            cy.get($tableRows)
              .its('length')
              .should('eq', 10)

            const columns = $tableRows.find('td')

            assertRow(0, columns, {
              location: 'LEI-1-1',
              cellType: 'Listener Cell',
              capacity: 3,
              spaces: 1,
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: 'Select cell',
            })

            assertRow(1, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(2, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(3, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(4, columns, {
              location: 'LEI-1-2',
              cellType: 'Gated Cell',
              capacity: 2,
              spaces: 0,
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: 'Select cell',
            })

            assertRow(5, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(6, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(7, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            expect($tableRows.last().get(0).innerText).to.contain('Cell swap\tSelect')
          })
      })
    })
  })
})
