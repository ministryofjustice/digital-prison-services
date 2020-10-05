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
          assessmentDescription: 'CSRA',
          assessmentComment: 'test',
          assessmentDate: '2020-01-10',
          classification: 'Standard',
        },
      ],
    })
    cy.task('stubBookingNonAssociations', {
      offenderNo: 'G6123VU',
      firstName: 'JOHN',
      lastName: 'SAUNDERS',
      agencyDescription: 'MOORLAND (HMP & YOI)',
      assignedLivingUnitDescription: 'MDI-1-1-015',
      nonAssociations: [
        {
          reasonCode: 'RIV',
          reasonDescription: 'Rival Gang',
          typeCode: 'LAND',
          typeDescription: 'Do Not Locate on Same Landing',
          effectiveDate: '2020-06-17T00:00:00',
          expiryDate: '2020-07-17T00:00:00',
          comments: 'Gang violence',
          offenderNonAssociation: {
            offenderNo: 'A12345',
            firstName: 'bob1',
            lastName: 'doe1',
            reasonCode: 'RIV',
            reasonDescription: 'Rival Gang',
            agencyDescription: 'MOORLAND (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-1-3-026',
          },
        },
      ],
    })

    cy.task('stubLocation', { locationId: 1, locationData: { parentLocationId: 2, description: 'MDI-1-1' } })
    cy.task('stubLocation', { locationId: 2, locationData: { parentLocationId: 3 } })
    cy.task('stubLocation', { locationId: 3, locationData: { locationPrefix: 'MDI-1' } })
    cy.task('stubUserMeRoles', [{ roleCode: 'CELL_MOVE' }])
    cy.task('stubUserCaseLoads')
  })

  context('with cell data', () => {
    const response = [
      {
        attributes: [{ description: 'Special Cell', code: 'SPC' }, { description: 'Gated Cell', code: 'GC' }],
        capacity: 2,
        description: 'LEI-1-2',
        id: 1,
        noOfOccupants: 2,
        userDescription: 'LEI-1-1',
      },
      {
        attributes: [{ code: 'LC', description: 'Listener Cell' }, { description: 'Gated Cell', code: 'GC' }],
        capacity: 3,
        description: 'LEI-1-1',
        id: 1,
        noOfOccupants: 2,
        userDescription: 'LEI-1-1',
      },
    ]

    beforeEach(() => {
      cy.task('stubCellsWithCapacity', { cells: response })
      cy.task('stubCellsWithCapacityByGroupName', { agencyId: 'MDI', groupName: 1, response })
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
              .should('eq', 9)

            const columns = $tableRows.find('td')

            assertRow(0, columns, {
              location: 'LEI-1-1',
              cellType: 'Gated Cell,\nListener Cell',
              capacity: 3,
              spaces: 1,
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: 'Select cell',
            })

            assertRow(1, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(2, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(3, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(4, columns, {
              location: 'LEI-1-2',
              cellType: 'Gated Cell',
              capacity: 2,
              spaces: 0,
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: 'Select cell',
            })

            assertRow(5, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(6, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })

            assertRow(7, columns, {
              location: '',
              cellType: '',
              capacity: '',
              spaces: '',
              occupier: 'Doe, Bob\nView details\nfor Doe, Bob\nNON-ASSOCIATION',
              csra: 'Standard\n\nView details\nfor Doe, Bob',
              relevantAlerts: 'PEEP',
              selectCell: '',
            })
          })
      })
    })

    it('should show non association warning', () => {
      const page = SelectCellPage.goTo(offenderNo, '1')
      page.nonAssociationWarning().contains('Smith, John has a non-association with a prisoner in this location.')
    })

    it('should NOT show the non association warning', () => {
      cy.task('stubBookingNonAssociations', null)
      const page = SelectCellPage.goTo(offenderNo)
      page.nonAssociationWarning().should('not.be.visible')
    })

    it('should navigate to the confirm cell move page on Move to cell swap', () => {
      const page = SelectCellPage.goTo(offenderNo, '1')

      page
        .selectCswapLink()
        .invoke('attr', 'href')
        .then(href => {
          expect(href).to.equal('/prisoner/A12345/cell-move/confirm-cell-move?cellId=C-SWAP')
        })
    })
  })

  context('without cell data', () => {
    const response = []

    beforeEach(() => {
      cy.task('stubCellsWithCapacity', { cells: response })
      cy.task('stubCellsWithCapacityByGroupName', { agencyId: 'MDI', groupName: 1, response })
    })

    it('should load without error and display no results message', () => {
      const page = SelectCellPage.goTo(offenderNo)

      page.checkStillOnPage()
      page.noResultsMessage().contains('There are no results for what you have chosen.')
    })
  })
})
