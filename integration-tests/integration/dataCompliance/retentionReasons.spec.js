const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const RetentionReasonsPage = require('../../pages/dataCompliance/retentionReasonsPage')
const PrisonerQuickLookPage = require('../../pages/prisonerProfile/prisonerQuickLookPage')

const offenderNo = 'A12345'

context('Retention reasons', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubGetOffenderRetentionReasons')
    cy.task('stubNoExistingOffenderRecord', { offenderNo })
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: { description: 'Moorland' } })
    cy.task('stubCreateRecord', { offenderNo })
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails: {
        ...offenderBasicDetails,
        dateOfBirth: '1990-02-01',
        offenderNo,
      },
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
    })
  })

  it('Should load the retention reasons page', () => {
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    const retentionReasonsPage = RetentionReasonsPage.verifyOnPage()
    retentionReasonsPage.offenderName().contains('Smith, John')
    retentionReasonsPage.offenderNumber().contains(offenderNo)
    retentionReasonsPage.offenderDob().contains('01/02/1990')
    retentionReasonsPage.offenderAgency().contains('Moorland')
    retentionReasonsPage.lastUpdateTimestamp().should('not.be.visible')
    retentionReasonsPage.lastUpdateUser().should('not.be.visible')
  })

  it('Should load the retention reasons page with existing reason', () => {
    cy.task('stubRetentionRecord', {
      offenderNo,
      record: {
        offenderNo: 'A12345',
        userId: 'SOME_USER',
        modifiedDateTime: '2020-02-01T03:04:05.987654',
        retentionReasons: [
          {
            reasonCode: 'OTHER',
            reasonDetails: 'Some other reason',
          },
        ],
      },
    })
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    const retentionReasonsPage = RetentionReasonsPage.verifyOnPage()
    retentionReasonsPage.offenderName().contains('Smith, John')
    retentionReasonsPage.offenderNumber().contains(offenderNo)
    retentionReasonsPage.offenderDob().contains('01/02/1990')
    retentionReasonsPage.offenderAgency().contains('Moorland')
    retentionReasonsPage.checkBoxOther().should('be.checked')
    retentionReasonsPage.moreDetailOther().contains('Some other reason')
    retentionReasonsPage.lastUpdateTimestamp().contains('01/02/2020 - 03:04 (UTC)')
    retentionReasonsPage.lastUpdateUser().contains('SOME_USER')
  })

  it('Should be able to create a record', () => {
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    const retentionReasonsPage = RetentionReasonsPage.verifyOnPage()
    retentionReasonsPage.checkBoxHighProfile().click()
    retentionReasonsPage.checkBoxOther().click()
    retentionReasonsPage.moreDetailOther().type('Some other reason')
    retentionReasonsPage.updateButton().click()
    cy.url().should('include', `prisoner/${offenderNo}`)
  })

  it('Should be able to update a record', () => {
    cy.task('stubRetentionRecord', {
      offenderNo,
      record: {
        offenderNo: 'A12345',
        userId: 'SOME_USER',
        modifiedDateTime: '2020-02-01T03:04:05.987654',
        retentionReasons: [
          {
            reasonCode: 'OTHER',
            reasonDetails: 'Some other reason',
          },
        ],
      },
    })
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    const retentionReasonsPage = RetentionReasonsPage.verifyOnPage()
    retentionReasonsPage.checkBoxHighProfile().click()
    retentionReasonsPage.checkBoxOther().click()
    retentionReasonsPage.updateButton().click()
    cy.url().should('include', `prisoner/${offenderNo}`)
  })

  it('Should prevent submitting empty form', () => {
    cy.task('stubRetentionRecord', {
      offenderNo,
      record: {
        offenderNo: 'A12345',
        userId: 'SOME_USER',
        modifiedDateTime: '2020-02-01T03:04:05.987654',
        retentionReasons: [
          {
            reasonCode: 'OTHER',
            reasonDetails: 'Some other reason',
          },
        ],
      },
    })
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    const retentionReasonsPage = RetentionReasonsPage.verifyOnPage()
    retentionReasonsPage.moreDetailOther().clear()
    retentionReasonsPage.updateButton().click()
    retentionReasonsPage.errorSummary().contains('Enter more detail')
  })
})
