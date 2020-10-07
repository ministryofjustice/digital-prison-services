const GlobalSearchPage = require('./globalSearchPage')

context('Global search', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login('/global-search')
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', {})
    cy.task('stubOffenderImage')
  })

  it('should call global search with name search', () => {
    cy.task('stubGlobalSearch')
    const globalSearchPage = GlobalSearchPage.verifyOnPage()
    const form = globalSearchPage.form()
    form
      .search()
      .clear()
      .type('quimby')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should(requests => {
      expect(requests).to.have.lengthOf(1)
      expect(JSON.parse(requests[0].body)).to.deep.equal({
        lastName: 'quimby',
        gender: 'ALL',
        location: 'ALL',
        includeAliases: true,
      })
    })
  })

  it('should call global search with offender number search', () => {
    cy.task('stubGlobalSearch')
    const globalSearchPage = GlobalSearchPage.verifyOnPage()
    const form = globalSearchPage.form()
    form
      .search()
      .clear()
      .type('A1234BC')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should(requests => {
      expect(requests).to.have.lengthOf(1)
      expect(JSON.parse(requests[0].body)).to.deep.equal({
        prisonerIdentifier: 'A1234BC',
        gender: 'ALL',
        location: 'ALL',
        includeAliases: true,
      })
    })
  })

  it('should populate search box with query', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search-results?searchText=quimby')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage
      .form()
      .search()
      .should('have.value', 'quimby')
  })

  it('should support search again', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search-results?searchText=common')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    const form = globalSearchPage.form()
    form.search().clear()
    form.search().type('again')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage
      .form()
      .search()
      .should('have.value', 'again')

    cy.task('verifyGlobalSearch').should(requests => {
      expect(requests).to.have.lengthOf(2)
      expect(JSON.parse(requests[1].body)).to.deep.equal({
        lastName: 'again',
        gender: 'ALL',
        location: 'ALL',
        includeAliases: true,
      })
    })
  })

  it('should present global search results', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search-results?searchText=quimby')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage.rows().should(rows => {
      expect(rows).to.have.lengthOf(3)
      expect(rows[1]).to.have.text('Quimby, FredA1234AC15/10/1977Leeds HMPQuimby, Fred')
      expect(rows[2]).to.have.text('Quimby, ArthurA1234AA15/09/1976Moorland HMPQuimby, Arthur')
    })
  })

  it('should present global search results with outside descriptions', () => {
    cy.task('stubGlobalSearchMultiplePages')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search-results?searchText=common')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage.rows().should(rows => {
      expect(rows).to.have.lengthOf(21)
      expect(rows[1]).to.have.text(
        'Common, Fred1T1001AA15/10/1977Outside - released from Low Newton (HMP)Common, Fred1'
      )
    })
  })

  it('should be able to navigate pages of results', () => {
    cy.task('stubGlobalSearchMultiplePages')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search-results?searchText=common')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage.rows().should(rows => {
      expect(rows).to.have.lengthOf(21)
      expect(rows[20]).to.have.text('Common, Fred20T1020AA15/10/1977Leeds HMPCommon, Fred20')
    })
    globalSearchPage.nextPage().click()
    globalSearchPage.rows().should(rows => {
      expect(rows).to.have.lengthOf(2)
      expect(rows[1]).to.have.text('Common, Fred21T1021AA15/10/1977Leeds HMPCommon, Fred21')
    })
    globalSearchPage.previousPage().click()
    globalSearchPage.rows().should(rows => {
      expect(rows).to.have.lengthOf(21)
      expect(rows[20]).to.have.text('Common, Fred20T1020AA15/10/1977Leeds HMPCommon, Fred20')
    })
  })

  it('should present search filters', () => {
    cy.task('stubGlobalSearch')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search-results?searchText=smith, john')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage
      .showFilters()
      .should('have.text', 'Show filters')
      .click()
      .should('have.text', 'Hide filters')
    globalSearchPage
      .locationSelect()
      .should('have.value', 'ALL')
      .select('OUT')
    globalSearchPage
      .genderSelect()
      .should('have.value', 'ALL')
      .select('F')
    globalSearchPage.dobDay().type('1')
    globalSearchPage.dobMonth().type('1')
    globalSearchPage.dobYear().type('1970')

    globalSearchPage
      .form()
      .submitButton()
      .click()

    GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage.clearFilters().click()
    globalSearchPage.locationSelect().should('have.value', 'ALL')
    globalSearchPage.genderSelect().should('have.value', 'ALL')
    globalSearchPage.dobDay().should('have.value', '')
    globalSearchPage.dobMonth().should('have.value', '')
    globalSearchPage.dobYear().should('have.value', '')

    globalSearchPage
      .showFilters()
      .click()
      .should('have.text', 'Show filters')

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should(requests => {
      expect(requests).to.have.lengthOf(2)
      expect(JSON.parse(requests[1].body)).to.deep.equal({
        lastName: 'smith',
        firstName: 'john',
        dateOfBirth: '1970-01-01',
        gender: 'F',
        location: 'OUT',
        includeAliases: true,
      })
    })
  })
})
