const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const visitsWithVisitors = require('../../mockApis/responses/visitsWithVisitors.json')

context('Prisoner visits', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubVisitsWithVisitors', { offenderBasicDetails })
    })

    it('should handle no results and have the correct page title', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="no-visit-results"]').should('contain.text', 'There are no visits for this prisoner')
      cy.get('h1').should('have.text', 'John Smith’s visits')
    })

    it('should display all establishments even if there are no results', () => {
      cy.task('stubVisitsPrisons', [])
      cy.visit(`/prisoner/${offenderNo}/visit-details`)
      cy.get('[data-test="establishment-type"]').should('contain.text', 'All')

      cy.get('[data-test="no-visit-results"]').should('contain.text', 'There are no visits for this prisoner')
    })

    it('should maintain form selections from search query', () => {
      cy.visit(
        `/prisoner/${offenderNo}/visit-details?visitType=OFFI&fromDate=17%2F07%2F2020&toDate=17%2F08%2F2020&establishment=HLI&status=SCH`
      )

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', 'OFFI')
      cy.get('[data-test="from-filter"]').should('have.value', '17/07/2020')
      cy.get('[data-test="to-filter"]').should('have.value', '17/08/2020')
      cy.get('[data-test="establishment-type"]').should('have.value', 'HLI')
      cy.get('[data-test="status-type"]').should('have.value', 'SCH')
    })

    it('should handle no data on filtered results', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details?visitType=OFFI&fromDate=17%2F07%2F2020&toDate=17%2F08%2F2020`)

      cy.get('[data-test="no-visit-results"]').should('contain.text', 'There are no visits for what you have selected')
    })

    it('should have a working clear link on the search form', () => {
      cy.visit(
        `/prisoner/${offenderNo}/visit-details?visitType=OFFI&fromDate=17%2F07%2F2020&toDate=17%2F08%2F2020&establishment=HLI&status=NORM`
      )

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', 'OFFI')
      cy.get('[data-test="from-filter"]').should('have.value', '17/07/2020')
      cy.get('[data-test="to-filter"]').should('have.value', '17/08/2020')
      cy.get('[data-test="establishment-type"]').should('have.value', 'HLI')
      cy.get('[data-test="status-type"]').should('have.value', 'NORM')

      cy.get('[data-test="clear-link"]').click()

      cy.get('[data-test="prisoner-visits-type"]').should('have.value', '')
      cy.get('[data-test="from-filter"]').should('have.value', '')
      cy.get('[data-test="to-filter"]').should('have.value', '')
      cy.get('[data-test="establishment-type"]').should('have.value', '')
      cy.get('[data-test="status-type"]').should('have.value', '')
    })

    it('should submit the search with the correct filter parameters', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)
      cy.get('#visitType').select('Official').should('have.value', 'OFFI')
      cy.get('#establishment').select('Hull (HMP)').should('have.value', 'HLI')
      cy.get('#status').select('Cancelled: No Visiting Order').should('have.value', 'CANC-NO_VO')
      cy.get('form').submit()

      cy.task('verifyVisitFilter').should((requests) => {
        expect(requests[requests.length - 1].queryParams).to.deep.equal({
          visitType: { key: 'visitType', values: ['OFFI'] },
          visitStatus: { key: 'visitStatus', values: ['CANC'] },
          cancellationReason: { key: 'cancellationReason', values: ['NO_VO'] },
          prisonId: { key: 'prisonId', values: ['HLI'] },
          paged: { key: 'paged', values: ['true'] },
          size: { key: 'size', values: ['20'] },
        })
      })
    })
  })

  context('When there is data', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubVisitsWithVisitors', {
        offenderBasicDetails,
        visitsWithVisitors,
      })
    })

    it('should have the same number of table rows as individual visitors from all visits', () => {
      const individualVisitors = visitsWithVisitors.content.reduce((acc, item) => acc + item.visitors.length, 0)

      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="prisoner-visits-results"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows)
              .its('length')
              .should('eq', individualVisitors + 1) // results plus table header
          })
      })
    })

    it('should render the correct data in the table', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="prisoner-visits-results"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .eq(1)
          .find('td')
          .then(($tableCells) => {
            expect($tableCells.get(0)).to.contain.text('16/07/2020')
            expect($tableCells.get(1)).to.contain.text('13:30 to 16:00')
            expect($tableCells.get(2)).to.contain.text('Social')
            expect($tableCells.get(3)).to.contain.text('Not entered')
            expect($tableCells.get(4)).to.contain.text('Dythispal Alfres')
            expect($tableCells.get(5)).to.contain.text('37')
            expect($tableCells.get(6)).to.contain.text('Friend')
            expect($tableCells.get(7)).to.contain.text('Moorland (HMP & YOI)')
          })
      })
    })

    it('should sort according to lead, dob and surname', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="prisoner-visits-results"]').then(($table) => {
        // lead is Henretris, rest sorted by dob
        cy.get($table).find('tr').eq(5).find('td').eq(4).should('contain.text', 'Esanarie Henretris')
        cy.get($table).find('tr').eq(6).find('td').eq(4).should('contain.text', 'Dikminna Keninda')
        cy.get($table).find('tr').eq(7).find('td').eq(4).should('contain.text', 'Aiykeloon Griffasina')
        cy.get($table).find('tr').eq(8).find('td').eq(4).should('contain.text', 'Aiykeloon Lamando')
        // lead is Henretis, rest sorted by surname then forename
        cy.get($table).find('tr').eq(15).find('td').eq(4).should('contain.text', 'Esanarie Henretris')
        cy.get($table).find('tr').eq(16).find('td').eq(4).should('contain.text', 'Aiykeloon Griffasina')
        cy.get($table).find('tr').eq(17).find('td').eq(4).should('contain.text', 'Aiykeloon Keninda')
        cy.get($table).find('tr').eq(18).find('td').eq(4).should('contain.text', 'Dikminna Keninda')
      })
    })

    it('should display not entered if no relationship', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="prisoner-visits-results"]').then(($table) => {
        cy.get($table).find('tr').eq(17).find('td').eq(6).should('contain.text', 'Granddaughter')
        cy.get($table).find('tr').eq(18).find('td').eq(6).should('contain.text', 'Not entered')
      })
    })

    it('should display correct status including search type', () => {
      cy.visit(`/prisoner/${offenderNo}/visit-details`)

      cy.get('[data-test="prisoner-visits-results"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .eq(2)
          .find('td')
          .eq(3)
          .should('contain.text', 'Cancelled: Operational Reasons-All Visits Cancelled')
        cy.get($table).find('tr').eq(3).find('td').eq(3).should('contain.text', 'Completed')
        cy.get($table).find('tr').eq(4).find('td').eq(3).should('contain.text', 'Terminated By Staff: Rubdown Level A')
      })
    })
  })
})
