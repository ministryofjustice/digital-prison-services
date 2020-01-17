Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const context = {}
const elite2api = {}
const whereaboutsApi = {}
const { getPrisonersUnaccountedFor } = require('../controllers/attendance/offenderActivities').offenderActivitesFactory(
  elite2api,
  whereaboutsApi
)

const scheduledActivitiesResponse = [
  {
    offenderNo: 'G7178GP',
    eventId: 378088468,
    bookingId: 1044681,
    locationId: 721763,
    firstName: 'ETIENNE',
    lastName: 'DELEWSKI',
    cellLocation: 'MDI-6-1-026',
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Cleaner HB6 PM',
    startTime: '2019-08-07T13:15:00',
    endTime: '2019-08-07T16:15:00',
    paid: false,
  },
  {
    offenderNo: 'G7178GP',
    eventId: 378065320,
    bookingId: 1044681,
    locationId: 200532,
    firstName: 'ETIENNE',
    lastName: 'DELEWSKI',
    cellLocation: 'MDI-6-1-026',
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Recovery PE 15.00pm',
    startTime: '2019-08-07T15:00:00',
    endTime: '2019-08-07T16:30:00',
    paid: false,
  },
  {
    offenderNo: 'G7178GP',
    eventId: 378065321,
    bookingId: 1044681,
    locationId: 200533,
    firstName: 'ETIENNE',
    lastName: 'DELEWSKI',
    cellLocation: 'MDI-6-1-026',
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Recovery PE 16.30pm',
    startTime: '2019-08-07T16:30:00',
    endTime: '2019-08-07T17:30:00',
    paid: false,
  },
  {
    offenderNo: 'G7179GP',
    eventId: 378065322,
    bookingId: 1044680,
    locationId: 200535,
    firstName: 'TEST',
    lastName: 'USER',
    cellLocation: 'MDI-6-1-027',
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Recovery PE 15.30pm',
    startTime: '2019-08-07T15:30:00',
    endTime: '2019-08-07T17:30:00',
    paid: false,
  },
]

describe('offender activities', () => {
  describe('getPrisonersUnaccountedFor()', () => {
    beforeEach(() => {
      elite2api.getOffenderActivities = jest.fn().mockReturnValue(scheduledActivitiesResponse)
      elite2api.getVisits = jest.fn().mockReturnValue([])
      elite2api.getAppointments = jest.fn().mockReturnValue([])
      whereaboutsApi.getPrisonAttendance = jest.fn().mockReturnValue({ attendances: [] })
    })

    it('should return the correct number of separate offender activities when there are is no matching attendance record', async () => {
      const response = await getPrisonersUnaccountedFor(context, 'LEI', '2019-08-07', 'PM')

      expect(response.length).toBe(4)
      expect(response).toEqual(scheduledActivitiesResponse.map(activity => ({ ...activity, eventsElsewhere: [] })))
    })

    it('should only return unaccounted for offender activities', async () => {
      whereaboutsApi.getPrisonAttendance.mockReturnValueOnce({
        attendances: [
          {
            id: 4896,
            bookingId: 1044681,
            eventId: 378088468,
            eventLocationId: 721763,
            period: 'PM',
            prisonId: 'MDI',
            attended: true,
            paid: true,
            eventDate: '2019-08-07',
            createDateTime: '2019-08-07T10:06:13.58809',
            createUserId: 'RCOOPER_ADM',
            modifyDateTime: '2019-08-07T10:06:13.58809',
            modifyUserId: 'RCOOPER_ADM',
            locked: false,
          },
        ],
      })

      const response = await getPrisonersUnaccountedFor(context, 'LEI', '2019-08-07', 'PM')

      expect(response).toEqual([
        {
          bookingId: 1044681,
          cellLocation: 'MDI-6-1-026',
          comment: 'Recovery PE 15.00pm',
          endTime: '2019-08-07T16:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065320,
          eventsElsewhere: [],
          firstName: 'ETIENNE',
          lastName: 'DELEWSKI',
          locationId: 200532,
          offenderNo: 'G7178GP',
          paid: false,
          startTime: '2019-08-07T15:00:00',
        },
        {
          bookingId: 1044681,
          cellLocation: 'MDI-6-1-026',
          comment: 'Recovery PE 16.30pm',
          endTime: '2019-08-07T17:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065321,
          eventsElsewhere: [],
          firstName: 'ETIENNE',
          lastName: 'DELEWSKI',
          locationId: 200533,
          offenderNo: 'G7178GP',
          paid: false,
          startTime: '2019-08-07T16:30:00',
        },
        {
          bookingId: 1044680,
          cellLocation: 'MDI-6-1-027',
          comment: 'Recovery PE 15.30pm',
          endTime: '2019-08-07T17:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065322,
          eventsElsewhere: [],
          firstName: 'TEST',
          lastName: 'USER',
          locationId: 200535,
          offenderNo: 'G7179GP',
          paid: false,
          startTime: '2019-08-07T15:30:00',
        },
      ])
    })

    it('should return activites populated with events and appointments', async () => {
      whereaboutsApi.getPrisonAttendance.mockReturnValueOnce({
        attendances: [
          {
            id: 4896,
            bookingId: 1044681,
            eventId: 378088468,
            eventLocationId: 721763,
            period: 'PM',
            prisonId: 'MDI',
            attended: true,
            paid: true,
            eventDate: '2019-08-07',
            createDateTime: '2019-08-07T10:06:13.58809',
            createUserId: 'RCOOPER_ADM',
            modifyDateTime: '2019-08-07T10:06:13.58809',
            modifyUserId: 'RCOOPER_ADM',
            locked: false,
          },
        ],
      })
      elite2api.getVisits = jest.fn().mockReturnValueOnce([
        {
          offenderNo: 'G7179GP',
          locationId: 26996,
          firstName: 'TEST',
          lastName: 'USER',
          event: 'VISIT',
          eventDescription: 'Visits',
          eventLocation: 'CLOSED VISITS',
          eventStatus: 'SCH',
          comment: 'Social Contact',
          startTime: '2019-08-07T13:30:00',
          endTime: '2019-08-07T16:00:00',
        },
      ])
      elite2api.getAppointments = jest.fn().mockReturnValueOnce([
        {
          offenderNo: 'G7179GP',
          locationId: 27218,
          firstName: 'TEST',
          lastName: 'USER',
          event: 'CANT',
          eventDescription: 'Canteen',
          eventLocation: 'BADMINTON',
          startTime: '2019-08-07T16:00:00',
        },
      ])

      const response = await getPrisonersUnaccountedFor(context, 'LEI', '2019-08-07', 'PM')

      expect(response).toEqual([
        {
          bookingId: 1044681,
          cellLocation: 'MDI-6-1-026',
          comment: 'Recovery PE 15.00pm',
          endTime: '2019-08-07T16:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065320,
          eventsElsewhere: [],
          firstName: 'ETIENNE',
          lastName: 'DELEWSKI',
          locationId: 200532,
          offenderNo: 'G7178GP',
          paid: false,
          startTime: '2019-08-07T15:00:00',
        },
        {
          bookingId: 1044681,
          cellLocation: 'MDI-6-1-026',
          comment: 'Recovery PE 16.30pm',
          endTime: '2019-08-07T17:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065321,
          eventsElsewhere: [],
          firstName: 'ETIENNE',
          lastName: 'DELEWSKI',
          locationId: 200533,
          offenderNo: 'G7178GP',
          paid: false,
          startTime: '2019-08-07T16:30:00',
        },
        {
          bookingId: 1044680,
          cellLocation: 'MDI-6-1-027',
          comment: 'Recovery PE 15.30pm',
          endTime: '2019-08-07T17:30:00',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventId: 378065322,
          eventsElsewhere: [
            {
              comment: 'Social Contact',
              endTime: '2019-08-07T16:00:00',
              event: 'VISIT',
              eventDescription: 'Visits',
              eventLocation: 'CLOSED VISITS',
              eventStatus: 'SCH',
              firstName: 'TEST',
              lastName: 'USER',
              locationId: 26996,
              offenderNo: 'G7179GP',
              startTime: '2019-08-07T13:30:00',
            },
            {
              event: 'CANT',
              eventDescription: 'Canteen',
              eventLocation: 'BADMINTON',
              firstName: 'TEST',
              lastName: 'USER',
              locationId: 27218,
              offenderNo: 'G7179GP',
              startTime: '2019-08-07T16:00:00',
            },
          ],
          firstName: 'TEST',
          lastName: 'USER',
          locationId: 200535,
          offenderNo: 'G7179GP',
          paid: false,
          startTime: '2019-08-07T15:30:00',
        },
      ])
    })
  })
})
