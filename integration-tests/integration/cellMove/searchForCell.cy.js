const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const SearchForCellPage = require('../../pages/cellMove/searchForCellPage')
const OffenderDetailsPage = require('../../pages/cellMove/offenderDetailsPage')

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
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
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
      })
      cy.task('stubOffenderNonAssociations', {
        agencyDescription: 'HMP Moorland',
        nonAssociations: [
          {
            effectiveDate: moment(),
            expiryDate: moment().add(2, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'HMP Moorland',
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
})
