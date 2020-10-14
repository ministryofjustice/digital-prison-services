context('A user can search for an offender', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLoginCourt')
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserMeRoles', [{ roleCode: 'VIDEO_LINK_COURT_USER' }])
    cy.task('stubUserMe')
    cy.task('stubUserCaseLoads')
    cy.task('stubAgencies', [
      {
        description: 'MOORLAND (HMP & YOI)',
        formattedDescription: 'Moorland (HMP & YOI)',
        agencyId: 'MDI',
        agencyType: 'INST',
      },
      {
        description: 'LEEDS (HMP)',
        formattedDescription: 'Leeds (HMP)',
        agencyId: 'LEI',
        agencyType: 'INST',
      },
      {
        description: 'WANDSWORTH (HMP)',
        formattedFescription: 'Wandsworth (HMP)',
        agencyId: 'WWI',
        agencyType: 'INST',
      },
    ])
  })

  it('should display errors if mandatory fields are empty', () => {
    cy.task('stubPrisonApiGlobalSearch')
    cy.visit('/videolink/prisoner-search')
    cy.get('button').click()
    cy.get('.govuk-error-summary').contains("You must search using either the prisoner's last name or prison number")
  })

  it('should handle missing dob fields', () => {
    cy.task('stubPrisonApiGlobalSearch')
    cy.visit('/videolink/prisoner-search')
    cy.get('#lastName').type('Offender')
    cy.get("[data-qa='other-search-details'] .govuk-details__summary-text").click()
    cy.get('#dobDay').type('1')
    cy.get('button').click()
    cy.get('.govuk-error-summary').contains('Date of birth must include a month')
    cy.get('.govuk-error-summary').contains('Date of birth must include a year')
    cy.get('#dobDay').clear()
    cy.get('#dobMonth').type('1')
    cy.get('#dobYear').type('1990')
    cy.get('button').click()
    cy.get('.govuk-error-summary').contains('Date of birth must include a day')
  })

  it('should return search results if name or number entered', () => {
    cy.task('stubPrisonApiGlobalSearch', [
      {
        offenderNo: 'G0011GX',
        firstName: 'TEST',
        middleNames: 'ING',
        lastName: 'OFFENDER',
        dateOfBirth: '1980-07-17',
        latestLocationId: 'WWI',
        latestLocation: 'Wandsworth',
        pncNumber: '1/2345',
      },
    ])
    cy.visit('/videolink/prisoner-search')
    cy.get('#lastName').type('Offender')
    cy.get('button').click()
    cy.get('table tr')
      .find('td')
      .then($cells => {
        expect($cells.length).to.eq(6)

        expect($cells.get(0)).to.contain('Test Offender')
        expect($cells.get(1)).to.contain('G0011GX')
        expect($cells.get(2)).to.contain('17 July 1980')
        expect($cells.get(3)).to.contain('Wandsworth')
        expect($cells.get(4)).to.contain('1/2345')
        expect($cells.get(5)).to.contain('Book video link')
      })
  })
})
