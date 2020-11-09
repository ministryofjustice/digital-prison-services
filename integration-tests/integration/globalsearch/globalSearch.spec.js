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
    cy.visit('/global-search/results?searchText=quimby')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage
      .form()
      .search()
      .should('have.value', 'quimby')
  })

  it('should support search again', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search/results?searchText=common')
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
    cy.visit('/global-search/results?searchText=quimby')

    cy.get('[data-test="global-search-results-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 2)
          expect($tableRows.get(0).innerText).to.contain(
            '\tQuimby, Fred\tA1234AC\t15/10/1977\tLeeds HMP\tQuimby, Fred\t'
          )
          expect($tableRows.get(1).innerText).to.contain(
            '\tQuimby, Arthur\tA1234AA\t15/09/1976\tMoorland HMP\tQuimby, Arthur\t'
          )
        })
    })
  })

  it('should present global search results with outside descriptions', () => {
    cy.task('stubGlobalSearchMultiplePages')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search/results?searchText=common')
    cy.get('[data-test="global-search-results-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 20)
          expect($tableRows.get(0).innerText).to.contain(
            '\tCommon, Fred1\tT1001AA\t15/10/1977\tOutside - released from Low Newton (HMP)\tCommon, Fred1\t'
          )
        })
    })
  })

  it('should be able to navigate pages of results', () => {
    cy.task('stubGlobalSearchMultiplePages')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search/results?searchText=common')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    cy.get('[data-test="global-search-results-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 20)
          expect($tableRows.get(19).innerText).to.contain(
            '\tCommon, Fred20\tT1020AA\t15/10/1977\tLeeds HMP\tCommon, Fred20\t'
          )
        })
    })
    globalSearchPage.nextPage().click()
    cy.get('[data-test="global-search-results-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 1)
          expect($tableRows.get(0).innerText).to.contain(
            '\tCommon, Fred21\tT1021AA\t15/10/1977\tLeeds HMP\tCommon, Fred21\t'
          )
        })
    })
    globalSearchPage.previousPage().click()
    cy.get('[data-test="global-search-results-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 20)
          expect($tableRows.get(19).innerText).to.contain(
            '\tCommon, Fred20\tT1020AA\t15/10/1977\tLeeds HMP\tCommon, Fred20\t'
          )
        })
    })
  })

  it('should present search filters', () => {
    cy.task('stubGlobalSearch')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search/results?searchText=smith, john')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage
      .showFilters()
      .should('contain.text', 'Filters')
      .click()
      .should('contain.text', 'Filters')
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
      .should('contain.text', 'Filters')

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should(requests => {
      expect(requests).to.have.lengthOf(3)
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
