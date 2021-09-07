context('Prisoner courses and qualifications details page', () => {
  const offenderNo = 'G6123VU'

  context('no course data available', () => {
    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })
    it('should show correct content and no table', () => {
      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('[data-test="no-courses-qualifications"]').should('exist')
      cy.get('[data-test="no-courses-qualifications"]').should(
        'have.text',
        'John Smith has no courses or qualifications'
      )
    })
  })
  context('data available', () => {
    const dummyEducation = {
      content: [
        {
          prn: 'G6123VU',
          establishmentName: 'HMP Moorland',
          courseName: 'Ocean Science',
          isAccredited: false,
          learningStartDate: '2021-05-13',
          learningPlannedEndDate: '2021-08-08',
          learningActualEndDate: null,
          outcome: null,
          outcomeGrade: null,
          withdrawalReasons: null,
          prisonWithdrawalReason: null,
          completionStatus:
            'The learner is continuing or intending to continue the learning activities leading to the learning aim',
          withdrawalReasonAgreed: false,
        },
        {
          prn: 'A1234AA',
          establishmentName: 'HMP Moorland',
          courseName: 'Foundation Degree in Arts in Equestrian Practice and Technology',
          isAccredited: true,
          learningStartDate: '2021-07-19',
          learningPlannedEndDate: '2022-06-16',
          learningActualEndDate: '2021-07-21',
          outcome: 'No achievement',
          outcomeGrade: 'Fail',
          withdrawalReasons: null,
          prisonWithdrawalReason: null,
          completionStatus: 'The learner has completed the learning activities leading to the learning aim',
          withdrawalReasonAgreed: false,
        },
        {
          prn: 'A1234AA',
          establishmentName: 'HMP Moorland',
          courseName: 'Certificate of Management',
          isAccredited: true,
          learningStartDate: '2021-07-01',
          learningPlannedEndDate: '2021-07-31',
          learningActualEndDate: '2021-07-08',
          outcome: 'Achieved',
          outcomeGrade: null,
          withdrawalReasons: 'Other',
          prisonWithdrawalReason: 'Changes in their risk profile meaning they can no longer take part in the learning',
          completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
          withdrawalReasonAgreed: true,
        },
      ],
    }

    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubLearnerEducation', dummyEducation)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should render the page with correct data', () => {
      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('.moj-pagination__results').should('have.text', 'Showing 3 results')
      cy.get('[data-test="no-courses-qualifications"]').should('not.exist')
      cy.get('thead')
        .find('th')
        .then(($columnHeader) => {
          expect($columnHeader.get(0).innerText).to.contain('Type')
          expect($columnHeader.get(1).innerText).to.contain('Course name')
          expect($columnHeader.get(2).innerText).to.contain('Location')
          expect($columnHeader.get(3).innerText).to.contain('Dates')
          expect($columnHeader.get(4).innerText).to.contain('Outcome')
          expect($columnHeader.get(5).innerText).to.contain('Outcome details')
        })
      cy.get('tbody tr')
        .find('td')
        .then(($cells) => {
          expect($cells.length).to.eq(18)
          expect($cells.get(0).innerText).to.contain('Non-accredited')
          expect($cells.get(1).innerText).to.contain('Ocean Science')
          expect($cells.get(3).innerText).to.contain('08/08/2021\nto 08/08/2021')
          expect($cells.get(5).innerText).to.contain('')
        })
    })
  })
})
