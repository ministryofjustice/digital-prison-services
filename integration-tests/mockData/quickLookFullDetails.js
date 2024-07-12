const moment = require('moment')

const bookingId = 14
const offenderNo = 'A1234A'

const quickLookFullDetails = {
  offence: [{ offenceDescription: 'Have blade/article which was sharply pointed in public place' }],
  prisonerDetails: [
    {
      imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03',
      dateOfBirth: moment().subtract(21, 'years').format('YYYY-MM-DD'),
      pncNumber: '12/3456A',
      croNumber: '12345/57B',
    },
  ],
  sentenceDetails: { sentenceDetail: { releaseDate: '2020-12-13' } },
  balances: { spends: 100, cash: 75.5, savings: 50, damageObligations: 65, currency: 'GBP' },
  iepSummary: {
    bookingId,
    iepDate: '2017-08-15',
    iepTime: '2017-08-15T16:04:35',
    iepLevel: 'Standard',
    daysSinceReview: 881,
    nextReviewDate: '2018-08-15',
    iepDetails: [],
  },
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
  prisonerNonAssociations: {
    prisonerNumber: offenderNo,
    firstName: 'Test',
    lastName: 'Prisoner',
    prisonId: 'MDI',
    prisonName: 'HMP Moorland',
    cellLocation: 'C-023',
    openCount: 1,
    closedCount: 0,
    nonAssociations: [
      {
        id: 42,
        role: 'VICTIM',
        roleDescription: 'Victim',
        reason: 'BULLYING',
        reasonDescription: 'Bullying',
        restrictionType: 'LANDING',
        restrictionTypeDescription: 'Cell and landing',
        comment: 'John was bullying Test',
        authorisedBy: 'USER_1',
        whenCreated: '2021-07-05T10:35:17',
        whenUpdated: '2021-07-05T10:35:17',
        updatedBy: 'USER_1',
        isClosed: false,
        closedBy: null,
        closedAt: null,
        closedReason: null,
        otherPrisonerDetails: {
          prisonerNumber: 'A0000AA',
          role: 'PERPETRATOR',
          roleDescription: 'Perpetrator',
          firstName: 'John',
          lastName: 'Doe',
          prisonId: 'MDI',
          prisonName: 'HMP Moorland',
          cellLocation: 'Z-122',
        },
      },
    ],
  },
  visitsSummary: {
    startDateTime: '2020-04-17T13:30:00',
    hasVisits: true,
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

module.exports = { quickLookFullDetails }
