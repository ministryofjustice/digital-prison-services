context('Prisoner CSRA History', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubOffenderBasicDetails', { firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
    cy.task('stubCsraAssessmentsForPrisoner', [
      {
        bookingId: 1,
        offenderNo,
        classificationCode: 'STANDARD',
        classification: 'Standard',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2011-06-02',
        nextReviewDate: '2011-06-03',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessorId: 17551,
        assessorUser: 'TQL59P',
      },
      {
        bookingId: 2,
        offenderNo,
        classificationCode: 'HI',
        classification: 'High',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2014-11-10',
        nextReviewDate: '2015-11-11',
        approvalDate: '2014-11-18',
        assessmentAgencyId: 'DNI',
        assessmentStatus: 'A',
        assessmentSeq: 3,
        assessmentComment: 'comment',
        assessorId: 397307,
        assessorUser: 'DQL61T',
      },
      {
        bookingId: 2,
        offenderNo,
        classificationCode: 'PEND',
        classification: 'Pending',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2013-11-10',
        nextReviewDate: '2014-11-11',
        approvalDate: '2013-11-18',
        assessmentAgencyId: 'DNI',
        assessmentStatus: 'A',
        assessmentSeq: 2,
        assessmentComment: 'comment',
        assessorId: 397307,
        assessorUser: 'DQL61T',
      },
    ])
    cy.task('stubAgencyDetails', {
      agencyId: 'DNI',
      details: {
        agencyId: 'DNI',
        description: 'Doncaster',
      },
    })
    cy.task('stubAgencyDetails', {
      agencyId: 'MDI',
      details: {
        agencyId: 'MDI',
        description: 'Moorland',
      },
    })
  })

  it('should load and display the correct content', () => {
    cy.visit(`/prisoner/${offenderNo}/csra-history`)

    cy.get('h1').contains('CSRA History for John Smith')
    cy.get('[data-test="csra-table"]').then($table => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then($tableRows => {
          cy.get($tableRows)
            .its('length')
            .should('eq', 3)
          expect($tableRows.get(0).innerText).to.contain('10/11/2014\tHigh\tDoncaster\tcomment')
          expect($tableRows.get(1).innerText).to.contain('10/11/2013\tPending\tDoncaster\tcomment')
          expect($tableRows.get(2).innerText).to.contain('02/06/2011\tStandard\tMoorland\tNot entered')
        })
    })
  })

  it('should filter correctly', () => {
    cy.visit(`/prisoner/${offenderNo}/csra-history`)
    cy.get('[data-test="csra-select"]').select('STANDARD')
    cy.get('[data-test="location-select"]').select('DNI')
    cy.get('[type="submit"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?csra=STANDARD&location=DNI')
    })
    cy.get('[data-test="csra-select"]').should('have.value', 'STANDARD')
    cy.get('[data-test="location-select"]').should('have.value', 'DNI')
    cy.get('[data-test="csra-table"]').should('not.exist')
    cy.get('[data-test="no-results-message"]').should('contain', 'There are no CSRAs to display.')
  })
})
