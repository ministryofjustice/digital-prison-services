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
  balances: { spends: 100, cash: 75.5, savings: 50, damageObligations: 0, currency: 'GBP' },
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

context('Prisoner quick look and zero damage obligations', () => {
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
    it('Should show correct Finances details when zero damage obligations', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('[data-test="money-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.length).to.eq(3)
          expect($summaryValues.get(0).innerText).to.eq('£100.00')
          expect($summaryValues.get(1).innerText).to.eq('£75.50')
          expect($summaryValues.get(2).innerText).to.eq('£50.00')
        })
    })
  })
})

context('Prisoner quick look and none-zero damage obligations', () => {
  before(() => {
    cy.task('reset')
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()

    quickLookFullDetails.balances.damageObligations = 65
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
    it('Should show correct Finances details when zero damage obligations', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('[data-test="money-summary"]')
        .find('dd')
        .then($summaryValues => {
          expect($summaryValues.length).to.eq(4)
          expect($summaryValues.get(0).innerText).to.eq('£100.00')
          expect($summaryValues.get(1).innerText).to.eq('£75.50')
          expect($summaryValues.get(2).innerText).to.eq('£50.00')
          expect($summaryValues.get(3).innerText).to.eq('£65.00')
        })
    })
  })
})

module.exports = { quickLookFullDetails }
