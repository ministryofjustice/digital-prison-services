Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const whereaboutsApi = {}
const config = {
  updateAttendancePrisons: ['LEI'],
}
const activityList = require('../controllers/activityList').getActivityListFactory(elite2Api, whereaboutsApi, config)
  .getActivityList

function createActivitiesResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      cellLocation: 'LEI-A-1-3',
      event: 'CHAP',
      eventDescription: 'Chapel',
      comment: 'comment13',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'CHAP',
      eventDescription: 'Chapel',
      comment: 'comment11',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      offenderNo: 'A1234AB',
      firstName: 'MICHAEL',
      lastName: 'SMITH',
      cellLocation: 'LEI-A-1-2',
      event: 'CHAP',
      eventDescription: 'Chapel',
      comment: 'comment12',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
  ]
}

function createAppointmentsResponse() {
  return [
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'GYM',
      eventDescription: 'The gym',
      comment: 'comment14',
      startTime: '2017-10-15T17:00:00',
      endTime: '2017-10-15T17:30:00',
    },
    {
      offenderNo: 'A1234ZZ',
      firstName: 'IRRELEVANT',
      lastName: 'PERSON',
      cellLocation: 'LEI-Z-1-1',
      event: 'GYM',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
  ]
}

function createVisitsResponse() {
  return [
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'VISIT',
      eventDescription: 'Official',
      comment: 'comment18',
      startTime: '2017-10-15T11:00:00',
      endTime: '2017-10-15T11:30:00',
    },
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      cellLocation: 'LEI-A-1-3',
      event: 'VISIT',
      eventDescription: 'Family',
      comment: 'comment19',
      startTime: '2017-10-15T11:00:00',
      endTime: '2017-10-15T18:30:00',
    },
  ]
}

beforeEach(() => {
  elite2Api.getActivityList = jest.fn()
  elite2Api.getVisits = jest.fn()
  elite2Api.getAppointments = jest.fn()
  elite2Api.getActivities = jest.fn()
  elite2Api.getSentenceData = jest.fn()
  elite2Api.getCourtEvents = jest.fn()
  elite2Api.getExternalTransfers = jest.fn()
  elite2Api.getAlerts = jest.fn()
  elite2Api.getAssessments = jest.fn()
  elite2Api.getDetailsLight = jest.fn()
  whereaboutsApi.getAttendance = jest.fn()
  whereaboutsApi.getAbsenceReasons = jest.fn()

  whereaboutsApi.getAbsenceReasons.mockReturnValue({
    triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
  })
  elite2Api.getVisits.mockReturnValue([])
  elite2Api.getAppointments.mockReturnValue([])
  elite2Api.getActivities.mockReturnValue([])
})

describe('Activity list controller', async () => {
  it('Should return no results as an empty array', async () => {
    elite2Api.getActivityList.mockReturnValue([])

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM')
    expect(response).toEqual([])

    expect(elite2Api.getActivityList.mock.calls.length).toBe(3)
    const query = { agencyId: 'LEI', locationId: -1, date: '2018-11-23', timeSlot: 'PM' }

    expect(elite2Api.getActivityList.mock.calls[0][1]).toEqual(Object.assign(query, { usage: 'PROG' }))
    expect(elite2Api.getActivityList.mock.calls[1][1]).toEqual(Object.assign(query, { usage: 'VISIT' }))
    expect(elite2Api.getActivityList.mock.calls[2][1]).toEqual(Object.assign(query, { usage: 'APP' }))

    expect(elite2Api.getVisits.mock.calls.length).toBe(1)
    expect(elite2Api.getAppointments.mock.calls.length).toBe(1)
    expect(elite2Api.getActivities.mock.calls.length).toBe(1)

    const criteria = { agencyId: 'LEI', date: '2018-11-23', timeSlot: 'PM', offenderNumbers: [] }
    expect(elite2Api.getVisits.mock.calls[0][1]).toEqual(criteria)
    expect(elite2Api.getAppointments.mock.calls[0][1]).toEqual(criteria)
    expect(elite2Api.getActivities.mock.calls[0][1]).toEqual(criteria)

    expect(elite2Api.getSentenceData).not.toHaveBeenCalled()
    expect(elite2Api.getCourtEvents).not.toHaveBeenCalled()
  })

  it('Should use the offender numbers returned from activity lists in visit, appointment and activity searches ', async () => {
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [{ offenderNo: 'B' }]
        case 'VISIT':
          return [{ offenderNo: 'C' }, { offenderNo: 'A' }]
        case 'APP':
          return [{ offenderNo: 'D' }]
        default:
          throw new Error('Unexpected')
      }
    })

    await activityList({}, 'LEI', -1, '23/11/2018', 'PM')

    const expectedOffenderNumbers = ['A', 'B', 'C', 'D']
    expect(elite2Api.getVisits.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
    expect(elite2Api.getActivities.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
    expect(elite2Api.getAppointments.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
  })

  it('Should assign visits, appointments and activities by offender number', async () => {
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [{ offenderNo: 'A' }, { offenderNo: 'B' }, { offenderNo: 'C' }]
        default:
          return []
      }
    })

    elite2Api.getVisits.mockReturnValue([{ offenderNo: 'A', locationId: 2 }, { offenderNo: 'B', locationId: 3 }])
    elite2Api.getAppointments.mockReturnValue([{ offenderNo: 'B', locationId: 4 }, { offenderNo: 'C', locationId: 5 }])
    elite2Api.getActivities.mockReturnValue([{ offenderNo: 'A', locationId: 6 }, { offenderNo: 'C', locationId: 7 }])
    elite2Api.getSentenceData.mockReturnValue([])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result).toEqual([
      {
        offenderNo: 'A',
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        eventsElsewhere: [{ offenderNo: 'A', locationId: 2 }, { offenderNo: 'A', locationId: 6 }],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        offenderNo: 'B',
        eventsElsewhere: [{ offenderNo: 'B', locationId: 3 }, { offenderNo: 'B', locationId: 4 }],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        offenderNo: 'C',
        eventsElsewhere: [{ offenderNo: 'C', locationId: 5 }, { offenderNo: 'C', locationId: 7 }],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
    ])
  })

  it('Should exclude visits, appointments and activities at the location from eventsElsewhere', async () => {
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [{ offenderNo: 'A' }, { offenderNo: 'B' }, { offenderNo: 'C' }]
        default:
          return []
      }
    })

    elite2Api.getVisits.mockReturnValue([{ offenderNo: 'A', locationId: 1 }, { offenderNo: 'B', locationId: 1 }])
    elite2Api.getAppointments.mockReturnValue([{ offenderNo: 'B', locationId: 2 }, { offenderNo: 'C', locationId: 1 }])
    elite2Api.getActivities.mockReturnValue([{ offenderNo: 'A', locationId: 1 }, { offenderNo: 'C', locationId: 3 }])
    elite2Api.getSentenceData.mockReturnValue([])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result).toEqual([
      {
        offenderNo: 'A',
        eventsElsewhere: [],
        courtEvents: [],
        releaseScheduled: false,
        scheduledTransfers: [],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        offenderNo: 'B',
        eventsElsewhere: [{ offenderNo: 'B', locationId: 2 }],
        courtEvents: [],
        releaseScheduled: false,
        scheduledTransfers: [],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        offenderNo: 'C',
        eventsElsewhere: [{ offenderNo: 'C', locationId: 3 }],
        courtEvents: [],
        releaseScheduled: false,
        scheduledTransfers: [],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
    ])
  })

  it('Should add visit and appointment details to activity array', async () => {
    elite2Api.getActivityList.mockImplementation(
      (context, { usage }) => (usage === 'PROG' ? createActivitiesResponse() : [])
    )

    elite2Api.getVisits.mockReturnValue(createVisitsResponse())
    elite2Api.getAppointments.mockReturnValue(createAppointmentsResponse())
    elite2Api.getActivities.mockReturnValue([])
    elite2Api.getSentenceData.mockReturnValue([])

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM')

    const criteria = {
      agencyId: 'LEI',
      date: '2018-11-23',
      timeSlot: 'PM',
      offenderNumbers: ['A1234AC', 'A1234AA', 'A1234AB'],
    }

    expect(elite2Api.getVisits.mock.calls[0][1]).toEqual(criteria)
    expect(elite2Api.getAppointments.mock.calls[0][1]).toEqual(criteria)
    expect(elite2Api.getActivities.mock.calls[0][1]).toEqual(criteria)

    expect(response).toEqual([
      {
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'CHAP',
        eventDescription: 'Chapel',
        comment: 'comment11',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        courtEvents: [],

        releaseScheduled: false,
        scheduledTransfers: [],
        alertFlags: [],
        category: '',

        eventsElsewhere: [
          {
            offenderNo: 'A1234AA',
            firstName: 'ARTHUR',
            lastName: 'ANDERSON',
            cellLocation: 'LEI-A-1-1',
            event: 'VISIT',
            eventDescription: 'Official',
            comment: 'comment18',
            startTime: '2017-10-15T11:00:00',
            endTime: '2017-10-15T11:30:00',
          },
          {
            offenderNo: 'A1234AA',
            firstName: 'ARTHUR',
            lastName: 'ANDERSON',
            cellLocation: 'LEI-A-1-1',
            event: 'GYM',
            eventDescription: 'The gym',
            comment: 'comment14',
            startTime: '2017-10-15T17:00:00',
            endTime: '2017-10-15T17:30:00',
          },
        ],
        attendanceInfo: null,
      },
      {
        offenderNo: 'A1234AB',
        firstName: 'MICHAEL',
        lastName: 'SMITH',
        cellLocation: 'LEI-A-1-2',
        comment: 'comment12',
        event: 'CHAP',
        eventDescription: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        eventsElsewhere: [],
        courtEvents: [],
        alertFlags: [],
        category: '',

        releaseScheduled: false,
        scheduledTransfers: [],
        attendanceInfo: null,
      },
      {
        offenderNo: 'A1234AC',
        firstName: 'FRED',
        lastName: 'QUIMBY',
        cellLocation: 'LEI-A-1-3',
        comment: 'comment13',
        event: 'CHAP',
        eventDescription: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        courtEvents: [],
        alertFlags: [],
        category: '',

        releaseScheduled: false,
        scheduledTransfers: [],
        eventsElsewhere: [
          {
            offenderNo: 'A1234AC',
            firstName: 'FRED',
            lastName: 'QUIMBY',
            cellLocation: 'LEI-A-1-3',
            comment: 'comment19',
            event: 'VISIT',
            eventDescription: 'Family',
            startTime: '2017-10-15T11:00:00',
            endTime: '2017-10-15T18:30:00',
          },
        ],
        attendanceInfo: null,
      },
    ])
  })

  it('should order activities by comment then by last name', async () => {
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [
            { offenderNo: 'A', comment: 'aa', lastName: 'b' },
            { offenderNo: 'B', comment: 'a', lastName: 'c' },
            { offenderNo: 'C', comment: 'a', lastName: 'a' },
            { offenderNo: 'D', comment: 'aa', lastName: 'a' },
            { offenderNo: 'E', comment: 'aa', lastName: 'c' },
            { offenderNo: 'F', comment: 'a', lastName: 'b' },
          ]
        default:
          return []
      }
    })

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result.map(event => event.offenderNo)).toEqual(['C', 'F', 'B', 'D', 'A', 'E'])
  })

  it('should order eventsElsewhere by startTime', async () => {
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [{ offenderNo: 'A', comment: 'aa', lastName: 'b' }]
        default:
          return []
      }
    })

    elite2Api.getVisits.mockReturnValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T00:00:00' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T13:00:00' },
    ])
    elite2Api.getAppointments.mockReturnValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T11:00:00' },
      { offenderNo: 'A', locationId: 2 },
    ])
    elite2Api.getActivities.mockReturnValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T14:00:01' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T14:00:00' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T13:59:59' },
    ])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result.map(event => event.offenderNo)).toEqual(['A'])
    expect(result[0].eventsElsewhere.map(event => event.startTime)).toEqual([
      '2017-10-15T00:00:00',
      '2017-10-15T11:00:00',
      '2017-10-15T13:00:00',
      '2017-10-15T13:59:59',
      '2017-10-15T14:00:00',
      '2017-10-15T14:00:01',
      undefined,
    ])
  })

  describe('Attendance information', () => {
    beforeEach(() => {
      elite2Api.getActivityList.mockImplementation((context, { usage }) => {
        switch (usage) {
          case 'PROG':
            return [{ offenderNo: 'A', comment: 'aa', lastName: 'b' }]
          default:
            return []
        }
      })
    })

    it('should call getAttendance with correct parameters', async () => {
      await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(whereaboutsApi.getAttendance).toHaveBeenCalledWith(
        {},
        { locationId: 1, agencyId: 'LEI', date: '2018-11-23', period: 'PM' }
      )
    })

    it('should load attendance details', async () => {
      whereaboutsApi.getAttendance.mockReturnValue([
        {
          id: 1,
          absentReason: 'AcceptableAbsence',
          attended: false,
          paid: true,
          bookingId: 1,
          eventDate: '2019-10-10',
          eventId: 1,
          eventLocationId: 1,
          period: 'AM',
          prisonId: 'LEI',
          comments: 'Some comments or case note text.',
          locked: true,
        },
        {
          id: 2,
          absentReason: 'Refused',
          attended: true,
          paid: false,
          bookingId: 2,
          eventDate: '2019-10-10',
          eventId: 1,
          eventLocationId: 1,
          period: 'AM',
          prisonId: 'LEI',
          locked: false,
        },
        {
          id: 3,
          attended: true,
          paid: true,
          bookingId: 3,
          eventDate: '2019-10-10',
          eventId: 1,
          eventLocationId: 1,
          period: 'AM',
          prisonId: 'LEI',
          locked: true,
        },
      ])

      elite2Api.getActivityList.mockImplementation((context, { usage }) => {
        switch (usage) {
          case 'PROG':
            return [
              { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1 },
              { offenderNo: 'B2', comment: 'Test comment', lastName: 'B', bookingId: 2 },
              { offenderNo: 'C3', comment: 'Test comment', lastName: 'C', bookingId: 3 },
            ]
          default:
            return []
        }
      })

      const response = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(response).toEqual([
        {
          bookingId: 1,
          alertFlags: [],
          category: '',
          comment: 'Test comment',
          courtEvents: [],
          eventsElsewhere: [],
          lastName: 'A',
          offenderNo: 'A1',
          releaseScheduled: false,
          scheduledTransfers: [],
          attendanceInfo: {
            absentReason: {
              value: 'AcceptableAbsence',
              name: 'Acceptable',
            },
            comments: 'Some comments or case note text.',
            other: true,
            paid: true,
            locked: true,
            id: 1,
          },
        },
        {
          bookingId: 2,
          alertFlags: [],
          category: '',
          comment: 'Test comment',
          courtEvents: [],
          eventsElsewhere: [],
          lastName: 'B',
          offenderNo: 'B2',
          releaseScheduled: false,
          scheduledTransfers: [],
          attendanceInfo: {
            absentReason: {
              value: 'Refused',
              name: 'Refused - IEP',
            },
            comments: undefined,
            other: true,
            paid: false,
            locked: false,
            id: 2,
          },
        },
        {
          bookingId: 3,
          alertFlags: [],
          category: '',
          comment: 'Test comment',
          courtEvents: [],
          eventsElsewhere: [],
          lastName: 'C',
          offenderNo: 'C3',
          releaseScheduled: false,
          scheduledTransfers: [],
          attendanceInfo: {
            comments: undefined,
            pay: true,
            paid: true,
            locked: true,
            id: 3,
          },
        },
      ])
    })

    it('should format absent reasons', async () => {
      whereaboutsApi.getAttendance.mockReturnValue([
        {
          id: 1,
          absentReason: 'UnacceptableAbsence',
          bookingId: 1,
        },
        {
          id: 2,
          absentReason: 'Refused',
          bookingId: 2,
        },
        {
          id: 3,
          absentReason: 'AcceptableAbsence',
          bookingId: 3,
        },
      ])

      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
      })

      elite2Api.getActivityList.mockImplementation((context, { usage }) => {
        switch (usage) {
          case 'PROG':
            return [
              { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1 },
              { offenderNo: 'B2', comment: 'Test comment', lastName: 'B', bookingId: 2 },
              { offenderNo: 'C3', comment: 'Test comment', lastName: 'C', bookingId: 3 },
            ]
          default:
            return []
        }
      })

      const response = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(response[0].attendanceInfo.absentReason.value).toBe('UnacceptableAbsence')
      expect(response[0].attendanceInfo.absentReason.name).toBe('Unacceptable - IEP')

      expect(response[1].attendanceInfo.absentReason.value).toBe('Refused')
      expect(response[1].attendanceInfo.absentReason.name).toBe('Refused - IEP')

      expect(response[2].attendanceInfo.absentReason.value).toBe('AcceptableAbsence')
      expect(response[2].attendanceInfo.absentReason.name).toBe('Acceptable')
    })
  })
})
