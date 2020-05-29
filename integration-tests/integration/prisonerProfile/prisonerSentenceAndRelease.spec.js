const PrisonerSentenceAndReleasePage = require('../../pages/prisonerProfile/prisonerSentenceAndReleasePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

context('Prisoner sentence and release', () => {
  before(() => {
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    // Maintain session between the two tests.
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('reset')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
    })
  })

  it('Should show correct release dates with overrides', () => {
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
        nonDtoReleaseDateType: 'CRD',
        additionalDaysAwarded: 5,
        nonDtoReleaseDate: '2020-04-01',
        sentenceExpiryDate: '2020-02-19',
        automaticReleaseDate: '2020-01-01',
        conditionalReleaseDate: '2020-02-01',
        nonParoleDate: '2019-02-03',
        postRecallReleaseDate: '2021-02-03',
        licenceExpiryDate: '2020-02-04',
        homeDetentionCurfewEligibilityDate: '2019-07-03',
        paroleEligibilityDate: '2022-02-03',
        homeDetentionCurfewActualDate: '2021-06-02',
        actualParoleDate: '2020-04-03',
        releaseOnTemporaryLicenceDate: '2025-02-03',
        earlyRemovalSchemeEligibilityDate: '2018-11-12',
        earlyTermDate: '2019-08-09',
        midTermDate: '2020-08-10',
        lateTermDate: '2021-08-11',
        topupSupervisionExpiryDate: '2020-10-14',
        tariffDate: '2021-05-07',
        dtoPostRecallReleaseDate: '2020-10-16',
      },
    })
    cy.visit('/prisoner/A12345/sentence-and-release')
    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.noReleaseDatesMessage().should('not.exist')

    prisonerSentenceAndReleasePage.currentReleaseDatesHeading().contains('Current expected release dates')
    prisonerSentenceAndReleasePage.earlyTemporaryDatesHeading().contains('Early and temporary release dates')
    prisonerSentenceAndReleasePage.licenceDatesHeading().contains('Licence dates')
    prisonerSentenceAndReleasePage.otherReleaseDatesHeading().contains('Other dates')

    prisonerSentenceAndReleasePage
      .currentReleaseDates()
      .find('dt')
      .then($summaryKeys => {
        expect($summaryKeys.get(0).innerText).to.eq('\n          Approved for home detention curfew\n        ')
        expect($summaryKeys.get(1).innerText).to.eq('\n          Approved for parole\n        ')
        expect($summaryKeys.get(2).innerText).to.eq('\n          Conditional release\n        ')
        expect($summaryKeys.get(3).innerText).to.eq('\n          Post recall release\n        ')
        expect($summaryKeys.get(4).innerText).to.eq('\n          Mid transfer\n        ')
        expect($summaryKeys.get(5).innerText).to.eq('\n          Automatic release\n        ')
        expect($summaryKeys.get(6).innerText).to.eq('\n          Non parole\n        ')
        expect($summaryKeys.get(7).innerText).to.eq('\n          Detention training post recall date\n        ')
      })

    prisonerSentenceAndReleasePage
      .currentReleaseDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          3 July 2019\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          3 February 2022\n        ')
        expect($summaryValues.get(2).innerText).to.eq('\n          1 February 2020\n        ')
        expect($summaryValues.get(3).innerText).to.eq('\n          3 February 2021\n        ')
        expect($summaryValues.get(4).innerText).to.eq('\n          10 August 2020\n        ')
        expect($summaryValues.get(5).innerText).to.eq('\n          1 January 2020\n        ')
        expect($summaryValues.get(6).innerText).to.eq('\n          3 February 2019\n        ')
        expect($summaryValues.get(7).innerText).to.eq('\n          16 October 2020\n        ')
      })

    prisonerSentenceAndReleasePage
      .earlyTemporaryDates()
      .find('dt')
      .then($summaryKeys => {
        expect($summaryKeys.get(0).innerText).to.eq('\n          Home detention curfew\n        ')
        expect($summaryKeys.get(1).innerText).to.eq('\n          Release on temporary licence\n        ')
        expect($summaryKeys.get(2).innerText).to.eq('\n          Early removal scheme\n        ')
        expect($summaryKeys.get(3).innerText).to.eq('\n          Parole\n        ')
        expect($summaryKeys.get(4).innerText).to.eq('\n          Early transfer\n        ')
      })

    prisonerSentenceAndReleasePage
      .earlyTemporaryDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          2 June 2021\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          3 February 2025\n        ')
        expect($summaryValues.get(2).innerText).to.eq('\n          12 November 2018\n        ')
        expect($summaryValues.get(3).innerText).to.eq('\n          3 April 2020\n        ')
        expect($summaryValues.get(4).innerText).to.eq('\n          9 August 2019\n        ')
      })

    prisonerSentenceAndReleasePage
      .licenceDates()
      .find('dt')
      .then($summaryKeys => {
        expect($summaryKeys.get(0).innerText).to.eq('\n          Licence expiry date\n        ')
        expect($summaryKeys.get(1).innerText).to.eq('\n          Sentence expiry\n        ')
        expect($summaryKeys.get(2).innerText).to.eq('\n          Top up supervision expiry\n        ')
      })

    prisonerSentenceAndReleasePage
      .licenceDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          4 February 2020\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          19 February 2020\n        ')
        expect($summaryValues.get(2).innerText).to.eq('\n          14 October 2020\n        ')
      })

    prisonerSentenceAndReleasePage
      .otherReleaseDates()
      .find('dt')
      .then($summaryKeys => {
        expect($summaryKeys.get(0).innerText).to.eq('\n          Late transfer\n        ')
        expect($summaryKeys.get(1).innerText).to.eq('\n          Tariff\n        ')
      })

    prisonerSentenceAndReleasePage
      .otherReleaseDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          11 August 2021\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          7 May 2021\n        ')
      })
  })

  it('Should show no data message when no dates', () => {
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {},
    })
    cy.visit('/prisoner/A12345/sentence-and-release')
    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.currentReleaseDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.earlyTemporaryDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.licenceDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.otherReleaseDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.currentReleaseDates().should('not.exist')
    prisonerSentenceAndReleasePage.earlyTemporaryDates().should('not.exist')
    prisonerSentenceAndReleasePage.licenceDates().should('not.exist')
    prisonerSentenceAndReleasePage.otherReleaseDates().should('not.exist')

    prisonerSentenceAndReleasePage
      .noReleaseDatesMessage()
      .contains('There are no recorded release dates for this prisoner')
  })

  it('Should only show sections with data in them', () => {
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {
        lateTermDate: '2021-08-11',
        tariffDate: '2021-05-07',
      },
    })
    cy.visit('/prisoner/A12345/sentence-and-release')
    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.noReleaseDatesMessage().should('not.exist')

    prisonerSentenceAndReleasePage.currentReleaseDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.earlyTemporaryDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.licenceDatesHeading().should('not.exist')
    prisonerSentenceAndReleasePage.currentReleaseDates().should('not.exist')
    prisonerSentenceAndReleasePage.earlyTemporaryDates().should('not.exist')
    prisonerSentenceAndReleasePage.licenceDates().should('not.exist')

    prisonerSentenceAndReleasePage.otherReleaseDatesHeading().contains('Other dates')

    prisonerSentenceAndReleasePage
      .otherReleaseDates()
      .find('dt')
      .then($summaryKeys => {
        expect($summaryKeys.get(0).innerText).to.eq('\n          Late transfer\n        ')
        expect($summaryKeys.get(1).innerText).to.eq('\n          Tariff\n        ')
      })

    prisonerSentenceAndReleasePage
      .otherReleaseDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          11 August 2021\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          7 May 2021\n        ')
      })
  })
})
