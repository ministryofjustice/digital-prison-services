const homepagePage = require('../../pages/homepage/homepagePage')

context('Homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')

    cy.task('stubUserMeRoles')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', [])
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubKeyworkerMigrated')
  })

  describe('Header', () => {
    it('should display the correct details for the logged in user', () => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      const page = homepagePage.goTo()

      page.loggedInName().contains('J. Stuart')
      page.activeLocation().contains('Moorland')

      page
        .manageAccountLink()
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).to.equal('http://localhost:9191/auth/account-details')
        })

      page.changeLocationLink().should('not.exist')
    })

    it('should show change location link when user has more than 1 caseload', () => {
      cy.task('stubLogin', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        caseloads: [
          {
            caseLoadId: 'MDI',
            description: 'Moorland',
            currentlyActive: true,
          },
          {
            caseLoadId: 'LEI',
            description: 'Leeds',
            currentlyActive: false,
          },
        ],
      })
      cy.login()

      const page = homepagePage.goTo()

      page
        .changeLocationLink()
        .should('be.visible')
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).to.equal('/change-caseload')
        })
    })
  })

  describe('Search', () => {
    it('should should submit to the correct location with the correct search terms', () => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      const page = homepagePage.goTo()

      page.searchKeywords().type('Smith')
      page.searchLocation().select('MDI-1')
      page.searchForm().submit()

      cy.url().should('include', `/prisoner-search?keywords=Smith&location=MDI-1`)
    })
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()
    })

    it('should show use of force', () => {
      const page = homepagePage.goTo()

      page.useOfForce().should('exist')
    })

    it('should show establishment roll', () => {
      const page = homepagePage.goTo()

      page.establishmentRoll().should('exist')
    })

    it('should show global search task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'GLOBAL_SEARCH' }])

      const page = homepagePage.goTo()

      page.globalSearch().should('exist')
    })

    it('should show manage prisoner whereabouts', () => {
      cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: true } })

      const page = homepagePage.goTo()

      page.managePrisonerWhereabouts().should('exist')
    })

    it('should show change someones cell task', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'CELL_MOVE' }])

      const page = homepagePage.goTo()

      page.changeSomeonesCell().should('exist')
    })

    it('should show pathfinder', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'PF_STD_PRISON' }])

      const page = homepagePage.goTo()

      page.pathfinder().should('exist')
    })

    it('should show hdc licences', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'LICENCE_RO' }])

      const page = homepagePage.goTo()

      page.hdcLicences().should('exist')
    })

    it('should show manage key workers', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'OMIC_ADMIN' }, { roleCode: 'KW_MIGRATION' }])

      const page = homepagePage.goTo()

      page.manageKeyWorkers().should('exist')
    })

    it('should show manage users', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'MAINTAIN_ACCESS_ROLES' }])

      const page = homepagePage.goTo()

      page.manageUsers().should('exist')
    })

    it('should show categorisation', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'CREATE_CATEGORISATION' }])

      const page = homepagePage.goTo()

      page.categorisation().should('exist')
    })

    it('should show book a secure move', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'PECS_OCA' }])

      const page = homepagePage.goTo()

      page.secureMove().should('exist')
    })

    it('should show prison offender managers', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'ALLOC_MGR' }])

      const page = homepagePage.goTo()

      page.pom().should('exist')
    })

    it('should show serious organised crime', () => {
      cy.task('stubUserMeRoles', [{ roleCode: 'SOC_CUSTODY' }])

      const page = homepagePage.goTo()

      page.soc().should('exist')
    })
  })

  describe('Footer', () => {
    it('should display the feedback banner with the correct href', () => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      const page = homepagePage.goTo()

      page
        .feedbackBanner()
        .find('a')
        .should('contain', 'Give feedback on this service')
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/')
        })
    })
  })
})
