const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const NotFoundPage = require('../../pages/notFound')

const offenderNo = 'A12345'

context('A user cannot view prisoner case notes', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: null,
      caseloads: [],
      roles: ['GLOBAL_SEARCH'],
    })
    cy.signIn()
    cy.task('stubCaseNoteTypes')

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
      keyworkerDetails: {},
      complexOffenders: {},
      offenderSearchDetails: {},
      caseloads: [],
    })
  })

  it('A user can cannot view a prisoners case notes if user does not have access to prisoners caseload', () => {
    // offender agencyId = MDI, while users caseloads is empty
    cy.visit(`/prisoner/${offenderNo}/case-notes`)

    NotFoundPage.verifyOnPage()
  })
})
