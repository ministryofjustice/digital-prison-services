const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')

const availableSlotsServiceFactory = require('../services/availableSlotsService')

const getTime = ({ momentDate = moment(), hour, minutes }) =>
  momentDate
    .hour(Number(hour))
    .minute(minutes)
    .seconds(0)
    .millisecond(0)

const getTimeWithFormat = options => getTime(options).format(DATE_TIME_FORMAT_SPEC)

describe('Available slots service', () => {
  const appointmentsService = {}
  const existingEventsService = {}

  beforeEach(() => {
    appointmentsService.getLocations = jest.fn()
    existingEventsService.getAppointmentsAtLocations = jest.fn()
  })

  it('should break day up into 30 minute chucks', () => {
    const availableSlotsService = availableSlotsServiceFactory(
      { existingEventsService, appointmentsService },
      { startOfDay: 9, endOfDay: 11, byMinutes: 30 }
    )
    const date = moment().format(DATE_ONLY_FORMAT_SPEC)

    const chunks = availableSlotsService.breakDayIntoSlots({ date })

    expect(chunks).toEqual([
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 0 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 30 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 30 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 0 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 0 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 30 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 30 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 11, minutes: 0 }),
      },
    ])
  })

  it('should filter out slots that overlap with booked slots', () => {
    const bookedSlots = [
      {
        startTime: getTime({ hour: 9, minutes: 45 }),
        endTime: getTime({ hour: 10, minutes: 0 }),
      },
      {
        startTime: getTime({ hour: 10, minutes: 0 }),
        endTime: getTime({ hour: 11, minutes: 0 }),
      },
    ]

    const availableSlotsService = availableSlotsServiceFactory(
      { appointmentsService, existingEventsService },
      { startOfDay: 9, endOfDay: 11, byMinutes: 30 }
    )
    const availableSlots = availableSlotsService.getAvailableSlots({
      bookedSlots,
      date: moment().format(DATE_ONLY_FORMAT_SPEC),
    })

    expect(availableSlots).toEqual([
      { startTime: getTimeWithFormat({ hour: 9, minutes: 0 }), endTime: getTimeWithFormat({ hour: 9, minutes: 30 }) },
    ])
  })

  it('should join slots together where the end and stat times meet', () => {
    const bookedSlots = [
      {
        startTime: getTime({ hour: 10, minutes: 30 }),
        endTime: getTime({ hour: 11, minutes: 0 }),
      },
    ]
    const availableSlotsService = availableSlotsServiceFactory(
      { existingEventsService, appointmentsService },
      { startOfDay: 9, endOfDay: 11, byMinutes: 30 }
    )
    const availableSlots = availableSlotsService.getAvailableSlots({
      bookedSlots,
      date: moment().format(DATE_ONLY_FORMAT_SPEC),
    })

    expect(availableSlots).toEqual([
      { startTime: getTimeWithFormat({ hour: 9, minutes: 0 }), endTime: getTimeWithFormat({ hour: 10, minutes: 0 }) },
    ])
  })

  it('should return one slot for whole period', () => {
    const bookedSlots = []
    const availableSlotsService = availableSlotsServiceFactory(
      { existingEventsService, appointmentsService },
      { startOfDay: 9, endOfDay: 17, byMinutes: 30 }
    )

    const date = moment().format(DATE_ONLY_FORMAT_SPEC)
    const availableSlots = availableSlotsService.getAvailableSlots({ bookedSlots, date })

    expect(availableSlots).toEqual([
      { startTime: getTimeWithFormat({ hour: 9, minutes: 0 }), endTime: getTimeWithFormat({ hour: 17, minutes: 0 }) },
    ])
  })

  it('should return time periods that have same or more length as the requested start + end time', () => {
    const bookedSlots = [{ startTime: getTime({ hour: 10, minutes: 30 }), endTime: getTime({ hour: 11, minutes: 0 }) }]

    const availableSlotsService = availableSlotsServiceFactory(
      { existingEventsService, appointmentsService },
      { startOfDay: 9, endOfDay: 11, byMinutes: 30 }
    )
    const availableSlots = availableSlotsService.getAvailableSlotsByMinLength({
      bookedSlots,
      minutesNeeded: 30,
      date: moment().format(DATE_ONLY_FORMAT_SPEC),
    })

    expect(availableSlots).toEqual([
      { startTime: getTimeWithFormat({ hour: 9, minutes: 0 }), endTime: getTimeWithFormat({ hour: 10, minutes: 0 }) },
    ])
  })

  it('should return available rooms that match slots', () => {
    const locations = [{ value: 1 }, { value: 2 }]
    const timeSlots = [
      { startTime: getTime({ hour: 9, minutes: 0 }), endTime: getTime({ hour: 10, minutes: 0 }) },
      { startTime: getTime({ hour: 10, minutes: 0 }), endTime: getTime({ hour: 11, minutes: 0 }) },
    ]
    const eventsAtLocations = [
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 9, minutes: 0 }),
        end: getTimeWithFormat({ hour: 17, minutes: 0 }),
      },
    ]

    const availableSlotsService = availableSlotsServiceFactory(
      { existingEventsService, appointmentsService },
      { startOfDay: 9, endOfDay: 11, byMinutes: 30 }
    )
    const availableRooms = availableSlotsService.getAvailableLocationsForSlots(
      {},
      { timeSlots, locations, eventsAtLocations }
    )
    expect(availableRooms).toEqual([{ value: 2 }])
  })

  describe('Putting it all together', () => {
    it('should only return a unique set of available rooms that meet the requested appointment duration of time', async () => {
      appointmentsService.getLocations.mockReturnValue([{ value: 1 }, { value: 2 }])
      existingEventsService.getAppointmentsAtLocations.mockReturnValue([
        {
          locationId: 1,
          start: getTimeWithFormat({ hour: 9, minutes: 0 }),
          end: getTimeWithFormat({ hour: 17, minutes: 0 }),
        },
      ])

      const availableSlotsService = availableSlotsServiceFactory(
        { existingEventsService, appointmentsService },
        { startOfDay: 9, endOfDay: 17, byMinutes: 5 }
      )

      const startTime = getTimeWithFormat({ hour: 9, minutes: 0 })
      const endTime = getTimeWithFormat({ hour: 11, minutes: 0 })
      const availableRooms = await availableSlotsService.getAvailableRooms({}, { agencyId: 'LEI', startTime, endTime })

      expect(availableRooms).toEqual([{ value: 2 }])
    })
  })
})
