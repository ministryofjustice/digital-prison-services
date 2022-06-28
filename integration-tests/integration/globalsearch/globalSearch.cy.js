const GlobalSearchPage = require('./globalSearchPage')

context('Global search', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn('/global-search')
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', {})
    cy.task('stubOffenderImage')
  })

  it('should call global search with name search', () => {
    cy.task('stubGlobalSearch')
    const globalSearchPage = GlobalSearchPage.verifyOnPage()
    const form = globalSearchPage.form()
    form.search().clear().type('quimby')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should((requests) => {
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
    form.search().clear().type('A1234BC')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should((requests) => {
      expect(requests).to.have.lengthOf(1)
      expect(JSON.parse(requests[0].body)).to.deep.equal({
        prisonerIdentifier: 'A1234BC',
        gender: 'ALL',
        location: 'ALL',
        includeAliases: true,
      })
    })
  })

  it('should not pass query string parameters to the feedback survey', () => {
    cy.task('stubGlobalSearch')
    const globalSearchPage = GlobalSearchPage.verifyOnPage()
    const form = globalSearchPage.form()
    form.search().clear().type('A1234BC')
    form.submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    cy.get('[data-test="feedback-banner"]')
      .find('a')
      .should('have.attr', 'href')
      .then((href) => {
        expect(href).to.equal('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/global-search/results')
      })
  })

  it('should populate search box with query', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search/results?searchText=quimby')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()
    globalSearchPage.form().search().should('have.value', 'quimby')
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

    globalSearchPage.form().search().should('have.value', 'again')

    cy.task('verifyGlobalSearch').should((requests) => {
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
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage.resultsTable().then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 2)
          expect($tableRows.get(0).innerText).to.contain(
            '\tQuimby, Fred\tA1234AC\t15/10/1977\tLeeds HMP\tQuimby, Fred\t'
          )
          expect($tableRows.get(1).innerText).to.contain(
            '\tQuimby, Arthur\tA1234AA\t15/09/1976\tMoorland HMP\tQuimby, Arthur\t'
          )
        })
    })
  })

  it('should only link to active prisoners', () => {
    cy.task('stubGlobalSearch')
    cy.visit('/global-search/results?searchText=quimby')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage.profileLinks().then(($profileLinks) => {
      cy.get($profileLinks).its('length').should('eq', 1)

      cy.get($profileLinks)
        .first()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/prisoner/A1234AC')
        })
    })
  })

  it('should present global search results with outside descriptions', () => {
    cy.task('stubGlobalSearchMultiplePages')
    cy.task('stubOffenderMovements')
    cy.visit('/global-search/results?searchText=common')
    const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage.resultsTable().then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 20)
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
    globalSearchPage.resultsTable().then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 20)
          expect($tableRows.get(19).innerText).to.contain(
            '\tCommon, Fred20\tT1020AA\t15/10/1977\tLeeds HMP\tCommon, Fred20\t'
          )
        })
    })
    globalSearchPage.nextPage().click()
    globalSearchPage.resultsTable().then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 1)
          expect($tableRows.get(0).innerText).to.contain(
            '\tCommon, Fred21\tT1021AA\t15/10/1977\tLeeds HMP\tCommon, Fred21\t'
          )
        })
    })
    globalSearchPage.previousPage().click()
    globalSearchPage.resultsTable().then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 20)
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
    globalSearchPage.showFilters().should('contain.text', 'Filters').click().should('contain.text', 'Filters')
    globalSearchPage.locationSelect().should('have.value', 'ALL').select('OUT')
    globalSearchPage.genderSelect().should('have.value', 'ALL').select('F')
    globalSearchPage.dobDay().type('1')
    globalSearchPage.dobMonth().type('1')
    globalSearchPage.dobYear().type('1970')

    globalSearchPage.form().submitButton().click()

    GlobalSearchPage.verifyOnResultsPage()

    globalSearchPage.clearFilters().click()
    globalSearchPage.locationSelect().should('have.value', 'ALL')
    globalSearchPage.genderSelect().should('have.value', 'ALL')
    globalSearchPage.dobDay().should('have.value', '')
    globalSearchPage.dobMonth().should('have.value', '')
    globalSearchPage.dobYear().should('have.value', '')

    globalSearchPage.showFilters().click().should('contain.text', 'Filters')

    GlobalSearchPage.verifyOnResultsPage()

    cy.task('verifyGlobalSearch').should((requests) => {
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

  describe('when user can has INACTIVE_BOOKINGS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        roles: [{ roleCode: 'INACTIVE_BOOKINGS' }],
      })
    })

    it('should link to both active and inactive prisoner profiles', () => {
      cy.task('stubGlobalSearch')
      cy.visit('/global-search/results?searchText=quimby')
      const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

      globalSearchPage.profileLinks().then(($profileLinks) => {
        cy.get($profileLinks).its('length').should('eq', 2)

        cy.get($profileLinks)
          .first()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal('/prisoner/A1234AC')
          })

        cy.get($profileLinks)
          .last()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal('/prisoner/A1234AA')
          })
      })
    })
  })

  describe('when user has LICENCE_RO role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        roles: [{ roleCode: 'LICENCE_RO' }],
      })
    })

    it('should have an update licence link for the active prisoner', () => {
      cy.task('stubGlobalSearch')
      cy.visit('/global-search/results?searchText=quimby')
      const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

      globalSearchPage.updateLicenceLinks().then(($licenceLinks) => {
        cy.get($licenceLinks).its('length').should('eq', 1)

        cy.get($licenceLinks)
          .first()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal('http://localhost:3003/hdc/taskList/1')
          })
      })
    })
  })

  describe('when user has LICENCE_RO and LICENCE_VARY roles', () => {
    beforeEach(() => {
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        roles: [{ roleCode: 'LICENCE_RO' }, { roleCode: 'LICENCE_VARY' }],
      })
    })

    it('should have an update licence link for both active and inactive prisoners', () => {
      cy.task('stubGlobalSearch')
      cy.visit('/global-search/results?searchText=quimby')
      const globalSearchPage = GlobalSearchPage.verifyOnResultsPage()

      globalSearchPage.updateLicenceLinks().then(($licenceLinks) => {
        cy.get($licenceLinks).its('length').should('eq', 2)
        cy.get($licenceLinks).eq(0).should('contain.text', 'Update HDC licence')
        cy.get($licenceLinks).eq(1).should('contain.text', 'Update HDC licence')

        cy.get($licenceLinks)
          .first()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal('http://localhost:3003/hdc/taskList/1')
          })

        cy.get($licenceLinks)
          .last()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal('http://localhost:3003/hdc/taskList/2')
          })
      })
    })
  })
})
