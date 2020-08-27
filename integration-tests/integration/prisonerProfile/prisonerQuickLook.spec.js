const prisonerQuickLookPage = require('../../pages/prisonerProfile/prisonerQuickLookPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const bookingId = 14
const offenderNo = 'A1234A'
const quickLookFullDetails = {
  offence: [{ offenceDescription: 'Have blade/article which was sharply pointed in public place' }],
  prisonerDetails: [
    {
      imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03',
      dateOfBirth: '1998-12-01',
      pncNumber: '12/3456A',
      croNumber: '12345/57B',
    },
  ],
  sentenceDetails: { sentenceDetail: { releaseDate: '2020-12-13' } },
  balances: { spends: 100, cash: 75.5, savings: 50, currency: 'GBP' },
  iepSummary: { daysSinceReview: 40 },
  positiveCaseNotes: { count: 2 },
  negativeCaseNotes: { count: 1 },
  adjudications: {
    adjudicationCount: 3,
    awards: [
      {
        sanctionCode: 'STOP_PCT',
        sanctionCodeDescription: 'Stoppage of Earnings (%)',
        days: 14,
        limit: 50,
        effectiveDate: '2020-04-16',
        status: 'IMMEDIATE',
        statusDescription: 'Immediate',
      },
      {
        sanctionCode: 'STOP_EARN',
        sanctionCodeDescription: 'Stoppage of Earnings (amount)',
        days: 14,
        limit: 50,
        comment: '14x SOE 50%, 14x LOC, 14x LOA 14x LOGYM, 14x LOTV 14x CC',
        effectiveDate: '2020-04-16',
        status: 'IMMEDIATE',
        statusDescription: 'Immediate',
      },
      {
        sanctionCode: 'CC',
        sanctionCodeDescription: 'Cellular Confinement',
        days: 14,
        effectiveDate: '2020-04-16',
        status: 'SUSP',
        statusDescription: 'Suspended',
      },
      {
        sanctionCode: 'FORFEIT',
        sanctionCodeDescription: 'Forfeiture of Privileges',
        days: 7,
        comment: '7x LOC, 7x LOA, 7x LOTV',
        effectiveDate: '2020-04-16',
        status: 'QUASHED',
        statusDescription: 'Quashed',
      },
    ],
  },
  nextVisit: {
    visitTypeDescription: 'Social Contact',
    leadVisitor: 'YRUDYPETER CASSORIA',
    relationshipDescription: 'Probation Officer',
    startTime: '2020-04-17T13:30:00',
  },
  visitBalances: { remainingVo: 24, remainingPvo: 4 },
  todaysEvents: [
    {
      bookingId,
      eventClass: 'INT_MOV',
      eventStatus: 'SCH',
      eventType: 'APP',
      eventTypeDesc: 'Appointment',
      eventSubType: 'EDUC',
      eventSubTypeDesc: 'Education',
      eventDate: '2020-04-17',
      startTime: '2020-04-17T09:00:00',
      endTime: '2020-04-17T10:00:00',
      eventLocation: 'BADMINTON',
      eventSource: 'APP',
      eventSourceCode: 'APP',
    },
    {
      bookingId,
      eventClass: 'INT_MOV',
      eventStatus: 'SCH',
      eventType: 'APP',
      eventTypeDesc: 'Appointment',
      eventSubType: 'CABE',
      eventSubTypeDesc: 'Case - Benefits',
      eventDate: '2020-04-17',
      startTime: '2020-04-17T13:00:00',
      endTime: '2020-04-17T14:00:00',
      eventLocation: 'CIRCUIT',
      eventSource: 'APP',
      eventSourceCode: 'APP',
      eventSourceDesc: 'Test Comment',
    },
    {
      bookingId,
      eventClass: 'INT_MOV',
      eventStatus: 'CANC',
      eventType: 'APP',
      eventTypeDesc: 'Appointment',
      eventSubType: 'GYMSH',
      eventSubTypeDesc: 'Gym - Sports Halls Activity',
      eventDate: '2020-04-17',
      startTime: '2020-04-17T15:00:00',
      endTime: '2020-04-17T15:30:00',
      eventLocation: 'BASKETBALL',
      eventSource: 'APP',
      eventSourceCode: 'APP',
      eventSourceDesc: 'Test comment',
    },
    {
      bookingId,
      eventClass: 'INT_MOV',
      eventStatus: 'SCH',
      eventType: 'APP',
      eventTypeDesc: 'Appointment',
      eventSubType: 'GYMF',
      eventSubTypeDesc: 'Gym - Football',
      eventDate: '2020-04-17',
      startTime: '2020-04-17T20:20:00',
      endTime: '2020-04-17T20:35:00',
      eventLocation: 'BADMINTON',
      eventSource: 'APP',
      eventSourceCode: 'APP',
      eventSourceDesc: 'Testing a really long comment which is over 40 characters',
    },
  ],
  profileInformation: [{ type: 'NAT', resultValue: 'British' }],
}

context('Prisoner quick look data retrieval errors', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
    })

    cy.task('stubQuickLookApiErrors')
    cy.visit(`/prisoner/${offenderNo}`)
  })

  it('Should display the appropriate message when there was an error requesting offence data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-offences"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting balance data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-balances"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting case note adjudications', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="incentives-and-adjudications"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting personal details', async () => {
    cy.get('[data-test="personal-details"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting visits', async () => {
    cy.get('[data-test="visit-details"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting schedules', async () => {
    cy.get('[data-test="schedules"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })
})

context('Prisoner quick look', () => {
  before(() => {
    cy.task('reset')
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()

    cy.task('stubQuickLook', quickLookFullDetails)
  })

  context('When a prisoner is in users caseload', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, profileInformation: [{ type: 'NAT', resultValue: 'British' }] },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should show correct tabs', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('ul.govuk-tabs__list')
        .find('li')
        .then($tabs => {
          expect($tabs.get(0).innerText).to.contain('Quick look')
          expect($tabs.get(1).innerText).to.contain('Personal')
          expect($tabs.get(2).innerText).to.contain('Alerts')
          expect($tabs.get(3).innerText).to.contain('Case notes')
          expect($tabs.get(4).innerText).to.contain('Sentence and release')
        })
    })

    it('Should show correct Offence details', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('[data-test="offence-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('Have blade/article which was sharply pointed in public place')
          expect($summaryValues.get(1).innerText).to.eq('Adult Imprisonment Without Option CJA03')
          expect($summaryValues.get(2).innerText).to.eq('13 December 2020')
        })
    })

    it('Should show correct Money details', () => {
      cy.get('[data-test="money-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('£100.00')
          expect($summaryValues.get(1).innerText).to.eq('£75.50')
          expect($summaryValues.get(2).innerText).to.eq('£50.00')
        })
    })

    it('Should show correct Case notes and adjudications details', () => {
      cy.get('[data-test="incentives-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('1')
          expect($summaryValues.get(1).innerText).to.eq('2')
          expect($summaryValues.get(2).innerText).to.eq('40 days ago')
        })

      cy.get('[data-test="adjudications-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('3')
          expect($summaryValues.get(1).innerText).to.eq(
            '14 days Stoppage of Earnings (50%)\n16/04/2020\n14 days Stoppage of Earnings (£50.00)\n14x SOE 50%, 14x LOC, 14x LOA 14x LOGYM, 14x LOTV 14x CC\n16/04/2020'
          )
        })
    })

    it('Should show correct Visits details', () => {
      cy.get('[data-test="visits-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('24')
          expect($summaryValues.get(1).innerText).to.eq('4')
          expect($summaryValues.get(2).innerText).to.eq('17 April 2020')
          expect($summaryValues.get(3).innerText).to.eq('Social Contact')
          expect($summaryValues.get(4).innerText).to.eq('Yrudypeter Cassoria (Probation Officer)')
        })
    })

    it('Should show correct Personal information details', () => {
      cy.get('[data-test="personal-info-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('21')
          expect($summaryValues.get(1).innerText).to.eq('British')
          expect($summaryValues.get(2).innerText).to.eq('12/3456A')
          expect($summaryValues.get(3).innerText).to.eq('12345/57B')
        })
    })

    it('Should show correct Schedule details', () => {
      cy.get('[data-test="schedule-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.get(0).innerText).to.eq('Education\n09:00 to 10:00')
          expect($summaryValues.get(1).innerText).to.eq(
            'Case - Benefits - Test Comment\n13:00 to 14:00\nGym - Sports Halls Activity - Test comment\n(cancelled)\n15:00 to 15:30'
          )
          expect($summaryValues.get(2).innerText).to.eq(
            'Gym - Football - Testing a really long comment which is o...\n20:20 to 20:35'
          )
        })
    })

    it('Should show the correct tabs and links', () => {
      cy.get('[data-test="tabs-quick-look"]').should('contain.text', 'Quick look')
      cy.get('[data-test="tabs-personal"]').should('contain.text', 'Personal')
      cy.get('[data-test="tabs-alerts"]').should('contain.text', 'Alerts')
      cy.get('[data-test="tabs-case-notes"]').should('contain.text', 'Case notes')
      cy.get('[data-test="tabs-sentence-release"]').should('contain.text', 'Sentence and release')
      cy.get('[data-test="adjudication-history-link"]').should('contain.text', 'View adjudication history')
      cy.get('[data-test="view-alerts-link"]').should('contain.text', 'View alerts')
      cy.get('[data-test="iep-details-link"]').should('contain.text', 'View details for Incentive Level')
      cy.get('[data-test="incentive-details-link"]').should('contain.text', 'View incentive level details')
    })
  })

  context('When a prisoner is NOT in users caseload', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not display conditionally displayed links to other pages', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="tabs-case-notes"]').should('not.be.visible')
      cy.get('[data-test="adjudication-history-link"]').should('not.be.visible')
      cy.get('[data-test="incentive-details-link"]').should('not.be.visible')
    })
  })

  context('When a user can view inactive bookings', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'INACTIVE_BOOKINGS' }],
        offenderNo,
      })
    })

    it('Should display conditionally displayed links to other pages', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="tabs-case-notes"]').should('contain.text', 'Case notes')
      cy.get('[data-test="adjudication-history-link"]').should('contain.text', 'View adjudication history')
      cy.get('[data-test="incentive-details-link"]').should('contain.text', 'View incentive level details')
    })
  })

  context('When a user CANNOT view inactive bookings', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not display conditionally displayed links to other pages', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="tabs-case-notes"]').should('not.be.visible')
      cy.get('[data-test="adjudication-history-link"]').should('not.be.visible')
    })
  })

  context('When a user has no roles relating to viewing probation documents', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('not.be.visible')
    })
  })

  context('When a user has VIEW_PROBATION_DOCUMENTS role', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }],
        offenderNo,
      })
    })

    it('Should show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('contain.text', 'View documents held by probation')
    })
  })

  context('When a user has POM role', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'POM' }],
        offenderNo,
      })
    })

    it('Should show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('contain.text', 'View documents held by probation')
    })
  })

  context('When a prisoner does NOT have a record retention record', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should display the correct text and link to retention records', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="data-retention-record-details"]').should(
        'contain.text',
        'Prevent removal of this offender record:\n      Not set - \n      \n        Update'
      )
      cy.get('[data-test="data-retention-record-details"] a').should(
        'have.attr',
        'href',
        `/offenders/${offenderNo}/retention-reasons`
      )
    })
  })

  context('When a prisoner does have a record retention record', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        retentionRecord: {
          offenderNo,
          retentionReasons: ['Reason1'],
        },
        offenderNo,
      })
    })

    it('Should display the correct text and link to retention records', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="data-retention-record-details"]').should(
        'contain.text',
        'Prevent removal of this offender record:\n      Yes - \n      \n        View reasons / update'
      )
      cy.get('[data-test="data-retention-record-details"] a').should(
        'have.attr',
        'href',
        `/offenders/${offenderNo}/retention-reasons`
      )
    })
  })

  context('When a user has a SOC role', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'SOC_CUSTODY' }],
        offenderNo,
      })
    })

    context('And prisoner is not in SOC', () => {
      beforeEach(() => {
        cy.task('stubSocOffenderDetails', {
          status: 404,
          body: { message: 'Offender not found' },
          offenderNumber: offenderNo,
        })
      })
      it('Should show Refer to SOC button', () => {
        cy.visit(`/prisoner/${offenderNo}`)
        cy.get('[data-test="soc-referral-button"]')
          .should('contain.text', 'Refer to SOC')
          .and('have.attr', 'href')
          .and('match', RegExp(`.*?/offender/${offenderNo}$`))
      })
    })

    context('And prisoner is in SOC', () => {
      beforeEach(() => {
        cy.task('stubSocOffenderDetails', {
          status: 200,
          body: { id: 1, status: 'ACTIVE', nomsId: offenderNo, history: [], band: '2' },
          offenderNumber: offenderNo,
        })
      })
      it('Should show View SOC profile link', () => {
        cy.visit(`/prisoner/${offenderNo}`)
        cy.get('[data-test="soc-profile-link"]')
          .should('contain.text', 'View SOC profile')
          .and('have.attr', 'href')
          .and('match', RegExp('.*?/nominal/1$'))
      })
    })
  })
})

module.exports = { quickLookFullDetails }
