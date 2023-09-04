const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SearchForCellPage = require('../../pages/cellMove/searchForCellPage')
const OffenderDetailsPage = require('../../pages/cellMove/offenderDetailsPage')
const SelectCellPage = require('../../pages/cellMove/selectCellPage')

const offenderNo = 'A12345'

context('A user can search for a cell', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_CELL_MOVE'] })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubOffenderNonAssociations', {})
    cy.task('stubGroups', { id: 'MDI' })
    cy.task('stubUserCaseLoads')
  })

  it('Shows the correct data for no non-associations and no csra comment', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    const page = SearchForCellPage.verifyOnPage()
    cy.get('[data-test="cell-move-header-information"]').then(($header) => {
      cy.get($header)
        .find('h3')
        .then(($headings) => {
          cy.get($headings).its('length').should('eq', 5)
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Current location')
          expect($headings.get(2).innerText).to.contain('CSRA rating')
          expect($headings.get(3).innerText).to.contain('Relevant alerts')
          expect($headings.get(4).innerText).to.contain('Non-associations')
        })
    })
    page.name().contains('Smith, John')
    page.livingUnit().contains('HMP Moorland')
    page.csra().contains('High')
    page.csraLink().should('be.visible')
    page.alerts().contains('None')
    page.nonAssociationsLink().should('not.exist')
    page.nonAssociationsMessage().contains('0 in NOMIS. Check local processes.')
  })

  context('Non-association and a CSR rating comment', () => {
    beforeEach(() => {
      cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    })
    it('Shows the correct data when there is a relevant non-association and a CSR rating comment', () => {
      cy.task('stubOffenderFullDetails', {
        ...offenderFullDetails,
        alerts: [
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'XGANG',
            alertCodeDescription: 'Gang member',
            alertId: 1,
            alertType: 'X',
            alertTypeDescription: 'Security',
            bookingId: 14,
            comment: 'silly',
            dateCreated: '2019-08-25',
            dateExpires: '2019-09-20',
            expired: false,
            expiredByFirstName: 'Jane',
            expiredByLastName: 'Smith',
            offenderNo: 'G3878UK',
          },
        ],
        assessments: [
          {
            assessmentCode: 'CSR',
            assessmentComment: 'Test comment',
            assessmentDescription: 'CSR',
          },
        ],
        assignedLivingUnit: {
          agencyId: 'MDI',
          locationId: 12345,
          description: 'HMP Moorland',
          agencyName: 'Moorland (HMP & YOI)',
        },
      })
      cy.task('stubOffenderNonAssociations', {
        agencyDescription: 'HMP Moorland',
        offenderNo: 'G3878UK',
        nonAssociations: [
          {
            effectiveDate: moment(),
            expiryDate: moment().add(2, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'HMP Moorland',
              assignedLivingUnitDescription: 'HMP Moorland',
              offenderNo: 'G3878UK',
            },
          },
        ],
      })
      const page = SearchForCellPage.verifyOnPage()
      cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
      cy.get('[data-test="cell-move-header-information"]').then(($header) => {
        cy.get($header)
          .find('h3')
          .then(($headings) => {
            cy.get($headings).its('length').should('eq', 5)
            expect($headings.get(0).innerText).to.contain('Name')
            expect($headings.get(1).innerText).to.contain('Current location')
            expect($headings.get(2).innerText).to.contain('CSRA rating')
            expect($headings.get(3).innerText).to.contain('Relevant alerts')
            expect($headings.get(4).innerText).to.contain('Non-associations')
          })
      })
      page.name().contains('Smith, John')
      page.detailsLink().contains('View details')
      page.livingUnit().contains('HMP Moorland')
      page.csra().contains('High')
      page.csraLink().contains('View details')
      page.alerts().contains('Gang member')
      page.numberOfNonAssociations().contains('1')
      page.nonAssociationsLink().contains('View non-associations')
      page.nonAssociationsMessage().should('not.exist')
    })
  })

  it('Passes the correct data to the select a cell page', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    const page = SearchForCellPage.verifyOnPage()
    const form = page.form()
    form.location().select('1')
    form.cellType().find('input[value="SO"]').check()
    form.submitButton().click()
    cy.url().should('include', 'select-cell?location=1&cellType=SO')
  })

  it('Correctly navigates between this page and offender details', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    cy.task('stubOffenderFullDetails', {
      ...offenderFullDetails,
      age: 29,
      religion: 'Some religion',
      physicalAttributes: {
        ethnicity: 'White',
        raceCode: 'W1',
      },
      profileInformation: [
        { type: 'SEXO', resultValue: 'Heterosexual' },
        { type: 'SMOKE', resultValue: 'No' },
      ],
    })
    cy.task('stubMainOffence', [{ offenceDescription: '13 hours overwork' }])
    const page = SearchForCellPage.verifyOnPage()
    page.detailsLink().click()
    const offenderDetailsPage = OffenderDetailsPage.verifyOnPage()
    offenderDetailsPage.backLink().click()
    SearchForCellPage.verifyOnPage()
  })

  it('should display the correct cell swap messaging and link', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)

    const page = SearchForCellPage.verifyOnPage()

    page
      .selectCswapText()
      .contains(
        'Create a space for another prisoner - this will leave John Smith without a cell. You must move them into a cell as soon as possible today.'
      )

    page
      .selectCswapLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('/prisoner/A12345/cell-move/confirm-cell-move?cellId=C-SWAP')
      })
  })

  describe('back button', () => {
    const inmate1 = {
      bookingId: 1,
      offenderNo: 'A1234BC',
      firstName: 'JOHN',
      lastName: 'SMITH',
      dateOfBirth: '1990-10-12',
      age: 29,
      agencyId: 'MDI',
      assignedLivingUnitId: 1,
      assignedLivingUnitDesc: 'UNIT-1',
      alertsDetails: ['XA', 'XVL'],
    }
    const inmate2 = {
      bookingId: 2,
      offenderNo: 'B4567CD',
      firstName: 'STEVE',
      lastName: 'SMITH',
      dateOfBirth: '1989-11-12',
      age: 30,
      agencyId: 'MDI',
      assignedLivingUnitId: 2,
      assignedLivingUnitDesc: 'UNIT-2',
      alertsDetails: ['RSS', 'XC'],
    }

    context('When referred from the prisoner search page', () => {
      beforeEach(() => {
        cy.task('stubInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.visit(`/change-someones-cell/prisoner-search?keywords=SMITH`)
      })

      it('should have a back button linking to the previous page', () => {
        cy.contains('Change cell').click()
        cy.contains('Search for a cell')
        cy.contains('Back').click()
        cy.contains('Search for a prisoner')
      })
    })

    context('When referred from the view residential location page', () => {
      beforeEach(() => {
        cy.task('stubInmates', {
          locationId: 'MDI-1',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.visit(`/change-someones-cell/view-residential-location?location=1`)
      })

      it('should have a back button linking to the previous page', () => {
        cy.contains('Change cell').click()
        cy.contains('Search for a cell')
        cy.contains('Back').click()
        cy.contains('All prisoners in a residential location')
      })
    })

    context('When referred from the cell history page', () => {
      const history = {
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
      }

      beforeEach(() => {
        cy.task('stubOffenderBasicDetails', offenderBasicDetails)
        cy.task('stubAgencyDetails', { agencyId: 'MDI', details: { agencyId: 'MDI', description: 'Moorland' } })
        cy.task('stubInmatesAtLocation', {
          inmates: [{ offenderNo: 'A1235A', firstName: 'Test', lastName: 'Offender' }],
        })
        cy.task('stubOffenderCellHistory', history)
        cy.task('stubStaff', {
          staffId: 'STAFF_1',
          details: { firstName: 'Staff', lastName: 'One', username: 'STAFF_1' },
        })
        cy.task('stubStaff', {
          staffId: 'STAFF_2',
          details: { firstName: 'Staff', lastName: 'Two', username: 'STAFF_2' },
        })
        cy.visit(`/prisoner/${inmate1.offenderNo}/cell-history`)
      })

      it('should have a back button linking to the previous page', () => {
        cy.contains('Change cell').click()
        cy.contains('Search for a cell')
        cy.contains('Back').click()
        cy.contains('John Smith\u2019s location details')
      })
    })

    context('When the user clicked back from the select cell page', () => {
      const response = [
        {
          attributes: [
            { description: 'Special Cell', code: 'SPC' },
            { description: 'Gated Cell', code: 'GC' },
          ],
          capacity: 2,
          description: 'LEI-1-2',
          id: 1,
          noOfOccupants: 2,
          userDescription: 'LEI-1-1',
        },
        {
          attributes: [
            { code: 'LC', description: 'Listener Cell' },
            { description: 'Gated Cell', code: 'GC' },
          ],
          capacity: 3,
          description: 'LEI-1-1',
          id: 1,
          noOfOccupants: 2,
          userDescription: 'LEI-1-1',
        },
      ]

      beforeEach(() => {
        cy.task('stubInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
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
              classificationCode: 'STANDARD',
            },
          ],
        })
        cy.task('stubOffenderNonAssociations', {
          offenderNo: 'G6123VU',
          firstName: 'JOHN',
          lastName: 'SAUNDERS',
          agencyDescription: 'MOORLAND (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-1-1-015',
          nonAssociations: [],
        })
        cy.task('stubLocation', { locationId: 1, locationData: { parentLocationId: 2, description: 'MDI-1-1' } })
        cy.task('stubLocation', { locationId: 2, locationData: { parentLocationId: 3 } })
        cy.task('stubLocation', { locationId: 3, locationData: { locationPrefix: 'MDI-1' } })
        cy.task('stubUserCaseLoads')
        cy.task('stubCellsWithCapacity', { cells: response })
        cy.task('stubCellsWithCapacityByGroupName', { agencyId: 'MDI', groupName: 1, response })

        SelectCellPage.goTo(inmate1.offenderNo)
        cy.contains('Select an available cell')
        cy.contains('Back').click()
        cy.contains('Search for a cell')
      })

      it('should have a back button linking to the prisoner search page', () => {
        cy.contains('Back').click()
        cy.contains('Search for a prisoner')
      })
    })
  })
})
