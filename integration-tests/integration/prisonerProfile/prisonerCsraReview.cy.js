context('Prisoner CSRA review', () => {
  const offenderNo = 'A1234A'
  const bookingId = 123

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  beforeEach(() => {
    cy.task('stubOffenderBasicDetails', { firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
    cy.task('stubCsraReviewForPrisoner', {
      bookingId,
      assessmentSeq: 1,
      review: {
        bookingId,
        assessmentSeq: 1,
        offenderNo,
        classificationCode: 'STANDARD',
        assessmentCode: 'CSRREV',
        cellSharingAlertFlag: true,
        assessmentDate: '2011-03-15',
        assessmentAgencyId: 'MDI',
        assessmentComment: 'Comments about the review',
        assessmentCommitteeCode: 'REVIEW',
        assessmentCommitteeName: 'Review Board',
        assessorUser: 'USER1',
        approvalDate: '2011-11-06',
        approvalCommitteeCode: 'REVIEW',
        approvalCommitteeName: 'Review Board',
        originalClassificationCode: 'LOW',
        classificationReviewReason: 'Previous History',
        nextReviewDate: '2011-06-13',
        questions: [
          {
            question: 'Is there a reason to suspect that the prisoner is abusing drugs / alcohol?',
            answer: 'No',
          },
        ],
      },
    })
    cy.task('stubAgencyDetails', {
      agencyId: 'MDI',
      details: {
        agencyId: 'MDI',
        description: 'Moorland',
      },
    })
    cy.task('stubGetStaffDetails', {
      staffId: 'USER1',
      response: { firstName: 'Staff', lastName: 'One' },
    })
  })

  it('should load and display the correct content', () => {
    cy.visit(`/prisoner/${offenderNo}/csra-review?assessmentSeq=1&bookingId=${bookingId}`)

    cy.get('h1').contains('CSRA review on 15 March 2011')

    cy.get('[data-test="review-summary"]').then(($summary) => {
      cy.get($summary)
        .find('dt')
        .then(($summaryLabels) => {
          cy.get($summaryLabels).its('length').should('eq', 7)
          expect($summaryLabels.get(0).innerText).to.contain('CSRA')
          expect($summaryLabels.get(1).innerText).to.contain('Override reason')
          expect($summaryLabels.get(2).innerText).to.contain('Authorised by')
          expect($summaryLabels.get(3).innerText).to.contain('Location')
          expect($summaryLabels.get(4).innerText).to.contain('Comments')
          expect($summaryLabels.get(5).innerText).to.contain('Reviewed by')
          expect($summaryLabels.get(6).innerText).to.contain('Next review date')
        })

      cy.get($summary)
        .find('dd')
        .then(($summaryValues) => {
          cy.get($summaryValues).its('length').should('eq', 7)
          expect($summaryValues.get(0).innerText).to.contain('Standard - this is an override from Low')
          expect($summaryValues.get(1).innerText).to.contain('Previous History')
          expect($summaryValues.get(2).innerText).to.contain('Review Board')
          expect($summaryValues.get(3).innerText).to.contain('Moorland')
          expect($summaryValues.get(4).innerText).to.contain('Comments about the review')
          expect($summaryValues.get(5).innerText).to.contain('Review Board - Staff One')
          expect($summaryValues.get(6).innerText).to.contain('13 June 2011')
        })

      cy.get('[data-test="review-question"]').then(($questions) => {
        cy.get($questions).its('length').should('eq', 1)

        expect($questions.get(0).innerText).to.contain(
          'Is there a reason to suspect that the prisoner is abusing drugs / alcohol?'
        )
      })

      cy.get('[data-test="review-answer"]').then(($answers) => {
        cy.get($answers).its('length').should('eq', 1)

        expect($answers.get(0).innerText).to.contain('No')
      })
    })
  })
})
