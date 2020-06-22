const prisonerQuickLookPage = require('../../pages/prisonerProfile/prisonerQuickLookPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const bookingId = 14
const offenderNo = 'A12345'

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
    })

    cy.task('stubQuickLookApiErrors')
    cy.visit(`/prisoner/${offenderNo}`)
  })

  it('should display the appropriate message when there was an error requesting offence data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-offences"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('should display the appropriate message when there was an error requesting balance data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-balances"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('should display the appropriate message when there was an error requesting case note adjudications', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="case-note-adjudications"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('should display the appropriate message when there was an error requesting personal details', async () => {
    cy.get('[data-test="personal-details"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('should display the appropriate message when there was an error requesting visits', async () => {
    cy.get('[data-test="visit-details"]')
      .find('p')
      .then($element => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('should display the appropriate message when there was an error requesting schedules', async () => {
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

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
    })

    cy.task('stubQuickLook', {
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
    })

    cy.visit(`/prisoner/${offenderNo}`)
  })

  it('Should show correct Offence details', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offence-summary"]')
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('Have blade/article which was sharply pointed in public place')
        expect($summaryValues.get(1).innerText).to.eq('Adult Imprisonment Without Option CJA03')
        expect($summaryValues.get(2).innerText).to.eq('13/12/2020')
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
    cy.get('[data-test="case-notes-summary"]')
      .find('dd')
      .then($summaryValues => {
        expect($summaryValues.get(0).innerText).to.eq('1')
        expect($summaryValues.get(1).innerText).to.eq('2')
        expect($summaryValues.get(2).innerText).to.eq('40 days ago')
        expect($summaryValues.get(3).innerText).to.eq('3')
        expect($summaryValues.get(4).innerText).to.eq(
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
        expect($summaryValues.get(2).innerText).to.eq('17/04/2020')
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
        expect($summaryValues.get(0).innerText).to.eq('Education\n09:00 - 10:00')
        expect($summaryValues.get(1).innerText).to.eq(
          "Case - Benefits - Test Comment\n13:00 - 14:00\nGym - Sports Halls Activity - Test comment <div class='highlight highlight--alert'>(cancelled)</div>\n15:00 - 15:30"
        )
        expect($summaryValues.get(2).innerText).to.eq(
          'Gym - Football - Testing a really long comment which is o...\n20:20 - 20:35'
        )
      })
  })
})
