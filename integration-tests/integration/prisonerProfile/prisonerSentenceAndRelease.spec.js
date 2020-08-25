const PrisonerSentenceAndReleasePage = require('../../pages/prisonerProfile/prisonerSentenceAndReleasePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

context('Prisoner sentence and release', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    // Maintain session between the two tests.
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo: 'A12345',
    })
    cy.task('stubOffenderBasicDetails', { bookingId: 1 })
    cy.task('stubClientCredentialsRequest')
  })

  it('Should show correct release dates with overrides', () => {
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
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
        tariffEarlyRemovalSchemeEligibilityDate: '2017-10-10',
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
        expect($summaryValues.get(0).innerText).to.eq('\n          2 June 2021\n        ')
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
        expect($summaryKeys.get(3).innerText).to.eq('\n          Tariff early removal scheme\n        ')
        expect($summaryKeys.get(4).innerText).to.eq('\n          Parole\n        ')
        expect($summaryKeys.get(5).innerText).to.eq('\n          Early transfer\n        ')
      })

    prisonerSentenceAndReleasePage
      .earlyTemporaryDates()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('\n          3 July 2019\n        ')
        expect($summaryValues.get(1).innerText).to.eq('\n          3 February 2025\n        ')
        expect($summaryValues.get(2).innerText).to.eq('\n          12 November 2018\n        ')
        expect($summaryValues.get(3).innerText).to.eq('\n          10 October 2017\n        ')
        expect($summaryValues.get(4).innerText).to.eq('\n          3 April 2020\n        ')
        expect($summaryValues.get(5).innerText).to.eq('\n          9 August 2019\n        ')
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
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
    cy.task('stubSentenceAdjustments', {})
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
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
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

  it('Should show appropriate message when no sentence adjustments are populated', () => {
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {},
    })
    cy.task('stubSentenceAdjustments', {
      additionalDaysAwarded: 0,
      lawfullyAtLarge: 0,
      recallSentenceRemand: 0,
      recallSentenceTaggedBail: 0,
      remand: 0,
      restoredAdditionalDaysAwarded: 0,
      specialRemission: 0,
      taggedBail: 0,
      unlawfullyAtLarge: 0,
      unusedRemand: 0,
    })

    cy.visit('/prisoner/A12345/sentence-and-release')
    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.noSentenceAdjustmentsMessage().contains('There are no sentence adjustments')
  })

  it('Should show the days removed section', () => {
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {},
    })
    cy.task('stubSentenceAdjustments', {
      additionalDaysAwarded: 0,
      recallSentenceRemand: 3,
      recallSentenceTaggedBail: 4,
      remand: 1,
      restoredAdditionalDaysAwarded: 5,
      specialRemission: 6,
      taggedBail: 2,
      unlawfullyAtLarge: 0,
      unusedRemand: 0,
    })
    cy.visit('/prisoner/A12345/sentence-and-release')

    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysAddedSection().should('not.exist')
    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysRemainingSection().should('not.exist')

    prisonerSentenceAndReleasePage
      .sentenceAdjustmentsDaysRemovedSection()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText.trim()).to.eq('1')
        expect($summaryValues.get(1).innerText.trim()).to.eq('3')
        expect($summaryValues.get(2).innerText.trim()).to.eq('4')
        expect($summaryValues.get(3).innerText.trim()).to.eq('5')
        expect($summaryValues.get(4).innerText.trim()).to.eq('6')
        expect($summaryValues.get(5).innerText.trim()).to.eq('2')
      })
  })

  it('Should show the days added section', () => {
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {},
    })
    cy.task('stubSentenceAdjustments', {
      additionalDaysAwarded: 1,
      recallSentenceRemand: 0,
      recallSentenceTaggedBail: 0,
      remand: 0,
      restoredAdditionalDaysAwarded: 0,
      specialRemission: 0,
      taggedBail: 0,
      unlawfullyAtLarge: 2,
      unusedRemand: 0,
    })
    cy.visit('/prisoner/A12345/sentence-and-release')

    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysRemovedSection().should('not.exist')
    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysRemainingSection().should('not.exist')

    prisonerSentenceAndReleasePage
      .sentenceAdjustmentsDaysAddedSection()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText.trim()).to.eq('1')
        expect($summaryValues.get(1).innerText.trim()).to.eq('2')
      })
  })

  it('Should show the unused remand time section', () => {
    cy.task('stubCourtCases', [])
    cy.task('stubOffenceHistory', [])
    cy.task('stubSentenceTerms', [])
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {},
    })
    cy.task('stubSentenceAdjustments', {
      additionalDaysAwarded: 0,
      recallSentenceRemand: 0,
      recallSentenceTaggedBail: 0,
      remand: 0,
      restoredAdditionalDaysAwarded: 0,
      specialRemission: 0,
      taggedBail: 0,
      unlawfullyAtLarge: 0,
      unusedRemand: 1,
    })
    cy.visit('/prisoner/A12345/sentence-and-release')

    const prisonerSentenceAndReleasePage = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysRemovedSection().should('not.exist')
    prisonerSentenceAndReleasePage.sentenceAdjustmentsDaysAddedSection().should('not.exist')

    prisonerSentenceAndReleasePage
      .sentenceAdjustmentsDaysRemainingSection()
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText.trim()).to.eq('1')
      })
  })

  it('should show court cases, offences and sentences', () => {
    cy.task('stubReleaseDatesOffenderNo', {
      sentenceDetail: {
        effectiveSentenceEndDate: '2022-03-19',
      },
    })
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [
      {
        id: 1,
        caseInfoNumber: 'T12345',
        agency: {
          agencyId: 'SHEFCC',
          description: 'Sheffield Crown Court',
          agencyType: 'CRT',
          active: true,
        },
      },
    ])
    cy.task('stubOffenceHistory', [
      { offenceDescription: 'C', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'b', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'a', primaryResultCode: '1002', caseId: 1 },
    ])
    cy.task('stubSentenceTerms', [
      {
        lineSeq: 6,
        sentenceStartDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
      {
        lineSeq: 1,
        sentenceStartDate: '2017-01-01',
        years: 12,
        months: 2,
        days: 1,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
    ])

    cy.visit('/prisoner/A12345/sentence-and-release')

    const page = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    page.caseNumber().contains('T12345')
    page.sentenceDate().contains('1 January 2017')
    page.courtName().contains('Sheffield Crown Court')
    page.sentenceHeader().contains('Sentence 1')
    page.sentenceHeader().contains('Sentence 6')
    page.sentenceDescriptions().contains('Some sentence info 1')
    page.sentenceDescriptions().contains('Some sentence info 6')

    page.offenceDescriptions().contains('a')
    page.offenceDescriptions().contains('b')
    page.offenceDescriptions().contains('C')

    page
      .sentenceTerms()
      .find('dd')
      .then($termValues => {
        expect($termValues.get(0).innerText.trim()).to.eq('1 January 2017')
        expect($termValues.get(1).innerText.trim()).to.eq('12 years, 2 months, 1 day')

        expect($termValues.get(2).innerText.trim()).to.eq('1 January 2018')
        expect($termValues.get(3).innerText.trim()).to.eq('12 years')
      })

    page
      .effectiveSentenceEndDate()
      .find('dd')
      .then($value => {
        expect($value.get(0).innerText.trim()).to.eq('19 March 2022')
      })
  })

  it('should change the offences label to offence, and inline the offence description', () => {
    cy.task('stubReleaseDatesOffenderNo', { sentenceDetail: {} })
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [{ id: 1, caseInfoNumber: 'T12345' }])
    cy.task('stubOffenceHistory', [{ offenceDescription: 'Offence test', primaryResultCode: '1002', caseId: 1 }])
    cy.task('stubSentenceTerms', [
      {
        lineSeq: 6,
        termSequence: 1,
        startDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
    ])

    cy.visit('/prisoner/A12345/sentence-and-release')

    const page = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    page.offenceHeader().contains('Offence')
    page.inlineOffenceDescription().contains('Offence test')
    page.offenceDescriptions().should('not.exist')
  })

  it('should show default no data message for sentences', () => {
    cy.task('stubReleaseDatesOffenderNo', { sentenceDetail: { effectiveSentenceEndDate: '2020-10-10' } })
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [{ id: 1, caseInfoNumber: 'T12345' }])
    cy.task('stubOffenceHistory', [{ offenceDescription: 'Offence test', primaryResultCode: '1002', caseId: 1 }])
    cy.task('stubSentenceTerms', [])

    cy.visit('/prisoner/A12345/sentence-and-release')

    const page = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    page.noSentenceDataMessage().contains('There are no current sentence details for this prisoner.')
  })

  it('should show default no data message for case number', () => {
    cy.task('stubReleaseDatesOffenderNo', { sentenceDetail: { effectiveSentenceEndDate: '2020-10-10' } })
    cy.task('stubSentenceAdjustments', {})
    cy.task('stubCourtCases', [{ id: 1 }])
    cy.task('stubOffenceHistory', [{ offenceDescription: 'Offence test', primaryResultCode: '1002', caseId: 1 }])
    cy.task('stubSentenceTerms', [
      {
        lineSeq: 6,
        termSequence: 1,
        startDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
    ])

    cy.visit('/prisoner/A12345/sentence-and-release')

    const page = PrisonerSentenceAndReleasePage.verifyOnPage('Smith, John')

    page.caseNumber().contains('Not entered')
  })
})
