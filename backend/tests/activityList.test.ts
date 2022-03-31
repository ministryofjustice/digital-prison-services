import { getActivityListFactory, getActivityListFactory as factory } from '../controllers/attendance/activityList'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = {
  getActivityList: jest.fn(),
  getVisits: jest.fn(),
  getAppointments: jest.fn(),
  getActivities: jest.fn(),
  getSentenceData: jest.fn(),
  getCourtEvents: jest.fn(),
  getExternalTransfers: jest.fn(),
  getAlerts: jest.fn(),
  getAlgetAssessmentserts: jest.fn(),
  getAssessments: jest.fn(),
  getDetailsLight: jest.fn(),
  getActivitiesAtLocation: jest.fn(),
  getAttendance: jest.fn(),
}
const whereaboutsApi = {
  getAttendance: jest.fn(),
}

const activityList = getActivityListFactory(prisonApi, whereaboutsApi).getActivityList

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
  prisonApi.getActivityList = jest.fn()
  prisonApi.getVisits = jest.fn()
  prisonApi.getAppointments = jest.fn()
  prisonApi.getActivities = jest.fn()
  prisonApi.getSentenceData = jest.fn()
  prisonApi.getCourtEvents = jest.fn()
  prisonApi.getExternalTransfers = jest.fn()
  prisonApi.getAlerts = jest.fn()
  prisonApi.getAssessments = jest.fn()
  prisonApi.getDetailsLight = jest.fn()
  prisonApi.getActivitiesAtLocation = jest.fn()
  whereaboutsApi.getAttendance = jest.fn()
  prisonApi.getVisits.mockResolvedValue([])
  prisonApi.getAppointments.mockResolvedValue([])
  prisonApi.getActivities.mockResolvedValue([])
})

describe('Activity list controller', () => {
  it('Should return no results as an empty array', async () => {
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue([])

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM')
    expect(response).toEqual([])

    expect(prisonApi.getActivityList.mock.calls.length).toBe(2)
    const query = { agencyId: 'LEI', locationId: -1, date: '2018-11-23', timeSlot: 'PM' }

    expect(prisonApi.getActivitiesAtLocation).toHaveBeenCalledWith({}, { ...query, includeSuspended: true })
    expect(prisonApi.getActivityList).toHaveBeenCalledWith({}, { ...query, usage: 'VISIT' })
    expect(prisonApi.getActivityList).toHaveBeenCalledWith({}, { ...query, usage: 'APP' })

    expect(prisonApi.getVisits.mock.calls.length).toBe(1)
    expect(prisonApi.getAppointments.mock.calls.length).toBe(1)
    expect(prisonApi.getActivities.mock.calls.length).toBe(1)

    const criteria = { agencyId: 'LEI', date: '2018-11-23', timeSlot: 'PM', offenderNumbers: [] }
    expect(prisonApi.getVisits.mock.calls[0][1]).toEqual(criteria)
    expect(prisonApi.getAppointments.mock.calls[0][1]).toEqual(criteria)
    expect(prisonApi.getActivities.mock.calls[0][1]).toEqual(criteria)

    expect(prisonApi.getSentenceData).not.toHaveBeenCalled()
    expect(prisonApi.getCourtEvents).not.toHaveBeenCalled()
  })

  it('Should use the offender numbers returned from activity lists in visit, appointment and activity searches ', async () => {
    prisonApi.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'VISIT':
          return [{ offenderNo: 'C' }, { offenderNo: 'A' }]
        case 'APP':
          return [{ offenderNo: 'D' }]
        default:
          throw new Error('Unexpected')
      }
    })

    prisonApi.getActivitiesAtLocation.mockResolvedValue([{ offenderNo: 'B' }])

    await activityList({}, 'LEI', -1, '23/11/2018', 'PM')

    const expectedOffenderNumbers = ['A', 'B', 'C', 'D']
    expect(prisonApi.getVisits.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
    expect(prisonApi.getActivities.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
    expect(prisonApi.getAppointments.mock.calls[0][1].offenderNumbers).toEqual(
      expect.arrayContaining(expectedOffenderNumbers)
    )
  })

  it('Should assign visits, appointments and activities by offender number', async () => {
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue([{ offenderNo: 'A' }, { offenderNo: 'B' }, { offenderNo: 'C' }])

    prisonApi.getVisits.mockResolvedValue([
      { offenderNo: 'A', locationId: 2 },
      { offenderNo: 'B', locationId: 3 },
    ])
    prisonApi.getAppointments.mockResolvedValue([
      { offenderNo: 'B', locationId: 4 },
      { offenderNo: 'C', locationId: 5 },
    ])
    prisonApi.getActivities.mockResolvedValue([
      { offenderNo: 'A', locationId: 6 },
      { offenderNo: 'C', locationId: 7 },
    ])
    prisonApi.getSentenceData.mockResolvedValue([])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result).toEqual([
      {
        offenderNo: 'A',
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        eventsElsewhere: [
          { offenderNo: 'A', locationId: 2 },
          { offenderNo: 'A', locationId: 6 },
        ],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        offenderNo: 'B',
        eventsElsewhere: [
          { offenderNo: 'B', locationId: 3 },
          { offenderNo: 'B', locationId: 4 },
        ],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
      {
        releaseScheduled: false,
        courtEvents: [],
        scheduledTransfers: [],
        offenderNo: 'C',
        eventsElsewhere: [
          { offenderNo: 'C', locationId: 5 },
          { offenderNo: 'C', locationId: 7 },
        ],
        alertFlags: [],
        category: '',
        attendanceInfo: null,
      },
    ])
  })

  it('Should exclude visits, appointments and activities at the location from eventsElsewhere', async () => {
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue([{ offenderNo: 'A' }, { offenderNo: 'B' }, { offenderNo: 'C' }])

    prisonApi.getVisits.mockResolvedValue([
      { offenderNo: 'A', locationId: 1 },
      { offenderNo: 'B', locationId: 1 },
    ])
    prisonApi.getAppointments.mockResolvedValue([
      { offenderNo: 'B', locationId: 2 },
      { offenderNo: 'C', locationId: 1 },
    ])
    prisonApi.getActivities.mockResolvedValue([
      { offenderNo: 'A', locationId: 1 },
      { offenderNo: 'C', locationId: 3 },
    ])
    prisonApi.getSentenceData.mockResolvedValue([])

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
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue(createActivitiesResponse())

    prisonApi.getVisits.mockResolvedValue(createVisitsResponse())
    prisonApi.getAppointments.mockResolvedValue(createAppointmentsResponse())
    prisonApi.getActivities.mockResolvedValue([])
    prisonApi.getSentenceData.mockResolvedValue([])

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM')

    const criteria = {
      agencyId: 'LEI',
      date: '2018-11-23',
      timeSlot: 'PM',
      offenderNumbers: ['A1234AC', 'A1234AA', 'A1234AB'],
    }

    expect(prisonApi.getVisits.mock.calls[0][1]).toEqual(criteria)
    expect(prisonApi.getAppointments.mock.calls[0][1]).toEqual(criteria)
    expect(prisonApi.getActivities.mock.calls[0][1]).toEqual(criteria)

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
    prisonApi.getActivitiesAtLocation.mockResolvedValue([
      { offenderNo: 'A', comment: 'aa', lastName: 'b' },
      { offenderNo: 'B', comment: 'a', lastName: 'c' },
      { offenderNo: 'C', comment: 'a', lastName: 'a' },
      { offenderNo: 'D', comment: 'aa', lastName: 'a' },
      { offenderNo: 'E', comment: 'aa', lastName: 'c' },
      { offenderNo: 'F', comment: 'a', lastName: 'b' },
    ])
    prisonApi.getActivityList.mockResolvedValue([])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result.map((event) => event.offenderNo)).toEqual(['C', 'F', 'B', 'D', 'A', 'E'])
  })

  it('should order eventsElsewhere by startTime', async () => {
    prisonApi.getActivitiesAtLocation.mockResolvedValue([{ offenderNo: 'A', comment: 'aa', lastName: 'b' }])
    prisonApi.getActivityList.mockResolvedValue([])

    prisonApi.getVisits.mockResolvedValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T00:00:00' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T13:00:00' },
    ])
    prisonApi.getAppointments.mockResolvedValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T11:00:00' },
      { offenderNo: 'A', locationId: 2 },
    ])
    prisonApi.getActivities.mockResolvedValue([
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T14:00:01' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T14:00:00' },
      { offenderNo: 'A', locationId: 2, startTime: '2017-10-15T13:59:59' },
    ])

    const result = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(result.map((event) => event.offenderNo)).toEqual(['A'])
    expect(result[0].eventsElsewhere.map((event) => event.startTime)).toEqual([
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
      prisonApi.getActivitiesAtLocation.mockResolvedValue([{ offenderNo: 'A', comment: 'aa', lastName: 'b' }])
      prisonApi.getActivityList.mockResolvedValue([])
    })

    it('should call getAttendance with correct parameters', async () => {
      await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(whereaboutsApi.getAttendance).toHaveBeenCalledWith(
        {},
        { locationId: 1, agencyId: 'LEI', date: '2018-11-23', period: 'PM' }
      )
    })

    it('should throw error when location is not a number and no call the APIs', async () => {
      try {
        await activityList({}, 'LEI', '--', '23/11/2018', 'PM')
      } catch (e) {
        expect(e).toEqual(new Error('Location ID is missing'))
        expect(whereaboutsApi.getAttendance.mock.calls.length).toBe(0)
        expect(prisonApi.getActivityList.mock.calls.length).toBe(0)
      }
    })

    it('should load attendance details', async () => {
      whereaboutsApi.getAttendance.mockResolvedValue({
        attendances: [
          {
            id: 1,
            absentReason: 'AcceptableAbsence',
            absentReasonDescription: 'Acceptable absence',
            absentSubReason: 'Courses',
            absentSubReasonDescription: 'Courses, programmes and interventions',
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
            absentReasonDescription: 'Refused to attend',
            absentSubReason: 'Behaviour',
            absentSubReasonDescription: 'Behaviour',
            attended: true,
            paid: false,
            bookingId: 2,
            eventDate: '2019-10-10',
            eventId: 2,
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
            eventId: 3,
            eventLocationId: 1,
            period: 'AM',
            prisonId: 'LEI',
            locked: true,
          },
        ],
      })

      prisonApi.getActivitiesAtLocation.mockResolvedValue([
        { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1, eventId: 1 },
        { offenderNo: 'B2', comment: 'Test comment', lastName: 'B', bookingId: 2, eventId: 2 },
        { offenderNo: 'C3', comment: 'Test comment', lastName: 'C', bookingId: 3, eventId: 3 },
      ])
      prisonApi.getActivityList.mockResolvedValue([])

      const response = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(response).toEqual([
        {
          bookingId: 1,
          alertFlags: [],
          category: '',
          eventId: 1,
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
              name: 'Acceptable absence',
            },
            absentSubReason: 'Courses',
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
          eventId: 2,
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
              name: 'Refused to attend',
            },
            absentSubReason: 'Behaviour',
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
          eventId: 3,
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
      whereaboutsApi.getAttendance.mockResolvedValue({
        attendances: [
          {
            id: 1,
            absentReason: 'UnacceptableAbsenceIncentiveLevelWarning',
            absentReasonDescription: 'Unacceptable absence - incentive level warning',
            bookingId: 1,
            absentSubReason: 'Behaviour',
            absentSubReasonDescription: 'Behaviour',
          },
          {
            id: 2,
            absentReason: 'RefusedIncentiveLevelWarning',
            absentReasonDescription: 'Refused to attend - incentive level warning',
            bookingId: 2,
            absentSubReason: 'ExternalMoves',
            absentSubReasonDescription: 'External moves',
          },
          {
            id: 3,
            absentReason: 'AcceptableAbsence',
            absentReasonDescription: 'Acceptable absence',
            bookingId: 3,
            absentSubReason: 'Courses',
            absentSubReasonDescription: 'Courses, programmes and interventions',
          },
        ],
      })

      prisonApi.getActivitiesAtLocation.mockResolvedValue([
        { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1 },
        { offenderNo: 'B2', comment: 'Test comment', lastName: 'B', bookingId: 2 },
        { offenderNo: 'C3', comment: 'Test comment', lastName: 'C', bookingId: 3 },
      ])
      prisonApi.getActivityList.mockResolvedValue([])

      const response = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

      expect(response[0].attendanceInfo.absentReason.value).toBe('UnacceptableAbsenceIncentiveLevelWarning')
      expect(response[0].attendanceInfo.absentReason.name).toBe('Unacceptable absence - incentive level warning')
      expect(response[0].attendanceInfo.absentSubReason).toBe('Behaviour')

      expect(response[1].attendanceInfo.absentReason.value).toBe('RefusedIncentiveLevelWarning')
      expect(response[1].attendanceInfo.absentReason.name).toBe('Refused to attend - incentive level warning')
      expect(response[1].attendanceInfo.absentSubReason).toBe('ExternalMoves')

      expect(response[2].attendanceInfo.absentReason.value).toBe('AcceptableAbsence')
      expect(response[2].attendanceInfo.absentReason.name).toBe('Acceptable absence')
      expect(response[2].attendanceInfo.absentSubReason).toBe('Courses')
    })
  })

  it('should attach attendance to the correct activity', async () => {
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue([
      { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1, eventLocationId: 2, eventId: 1 },
      { offenderNo: 'B2', comment: 'Test comment', lastName: 'B', bookingId: 1, eventLocationId: 2, eventId: 2 },
    ])
    whereaboutsApi.getAttendance.mockResolvedValue({
      attendances: [
        {
          id: 1,
          absentReason: 'UnacceptableAbsenceIncentiveLevelWarning',
          absentReasonDescription: 'Unacceptable absence - incentive level warning',
          absentSubReason: 'Behaviour',
          absentSubReasonDescription: 'Behaviour',
          bookingId: 1,
          eventId: 2,
          eventLocationId: 2,
        },
      ],
    })

    const response = await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(response[0].eventId).toBe(1)
    expect(response[0].attendanceInfo).toBe(null)

    expect(response[1].eventId).toBe(2)
    expect(response[1].attendanceInfo).toEqual({
      id: 1,
      absentReason: {
        name: 'Unacceptable absence - incentive level warning',
        value: 'UnacceptableAbsenceIncentiveLevelWarning',
      },
      absentSubReason: 'Behaviour',
      comments: undefined,
      paid: undefined,
      locked: undefined,
      other: true,
    })
  })

  it('should request attendance for all establishments', async () => {
    prisonApi.getActivityList.mockResolvedValue([])
    prisonApi.getActivitiesAtLocation.mockResolvedValue([
      { offenderNo: 'A1', comment: 'Test comment', lastName: 'A', bookingId: 1, eventLocationId: 2, eventId: 1 },
    ])
    whereaboutsApi.getAttendance.mockResolvedValue({ attendances: [] })

    const { getActivityList: service } = factory(prisonApi, whereaboutsApi)

    await service({}, 'LEI', 1, '23/11/2018', 'PM')
    await service({}, 'MDI', 1, '23/11/2018', 'PM')

    expect(whereaboutsApi.getAttendance.mock.calls.length).toBe(2)
  })
})
