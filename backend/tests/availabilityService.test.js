const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')
const { availabilityServiceFactory } = require('../controllers/attendance/availabilityService')

describe('Availability service', () => {
  const agency = 'MDI'
  const existingEventsService = {}
  const appointmentService = {}

  beforeEach(() => {
    appointmentService.getLocations = jest.fn()
    existingEventsService.getExistingEventsForLocation = jest.fn()

    appointmentService.getLocations.mockReturnValue(Promise.resolve([]))
    existingEventsService.getExistingEventsForLocation.mockReturnValue(Promise.resolve([]))
  })

  it('should make a call to getLocations', async () => {
    const { getAvailableLocations } = availabilityServiceFactory(existingEventsService, appointmentService)

    await getAvailableLocations({}, agency, {})

    expect(appointmentService.getLocations).toHaveBeenCalledWith({}, agency, 'VIDE')
  })

  it('should make a call to getExistingEventsForLocation', async () => {
    appointmentService.getLocations.mockReturnValue(Promise.resolve([{ value: 1 }, { value: 2 }]))
    const { getAvailableLocations } = availabilityServiceFactory(existingEventsService, appointmentService)

    const today = moment().format(DAY_MONTH_YEAR)

    await getAvailableLocations({}, agency, {})

    expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, agency, 1, today)
    expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, agency, 2, today)
  })

  it('should handle time slot where location booking slightly overlap ', async () => {
    const { getAvailableLocations } = availabilityServiceFactory(existingEventsService, appointmentService)
    const today = moment().format(DATE_ONLY_FORMAT_SPEC)
    const startTime = `${today}T09:00:00`
    const endTime = `${today}T13:00:00`

    appointmentService.getLocations.mockReturnValue([
      { value: 1, text: 'Location 1' },
      { value: 2, text: 'Location 2' },
    ])

    existingEventsService.getExistingEventsForLocation.mockImplementation((context, agencyId, locationId) => {
      return locationId === 1
        ? Promise.resolve([
            {
              startTime: `${today}T10:00:00`,
              endTime: `${today}T15:00:00`,
              eventDescription: 'Video booking for John',
            },
          ])
        : Promise.resolve([])
    })

    const availableLocations = await getAvailableLocations({}, agency, { startTime, endTime })
    expect(availableLocations).toEqual([{ value: 2, text: 'Location 2' }])
  })

  it('should handle a location being fully booked for the whole day', async () => {
    const { getAvailableLocations } = availabilityServiceFactory(existingEventsService, appointmentService)
    const today = moment().format(DATE_ONLY_FORMAT_SPEC)
    const startTime = `${today}T09:00:00`
    const endTime = `${today}T13:00:00`

    appointmentService.getLocations.mockReturnValue([
      { value: 1, text: 'Location 1' },
      { value: 2, text: 'Location 2' },
    ])

    existingEventsService.getExistingEventsForLocation.mockImplementation((context, agencyId, locationId) => {
      return locationId === 1
        ? Promise.resolve([
            {
              startTime: `${today}T09:00:00`,
              endTime: `${today}T10:00:00`,
            },
            {
              startTime: `${today}T11:00:00`,
              endTime: `${today}T12:00:00`,
            },
            {
              startTime: `${today}T13:00:00`,
              endTime: `${today}T14:00:00`,
            },
            {
              startTime: `${today}T15:00:00`,
              endTime: `${today}T16:00:00`,
            },
            {
              startTime: `${today}T17:00:00`,
              endTime: `${today}T18:00:00`,
            },
          ])
        : Promise.resolve([])
    })

    const availableLocations = await getAvailableLocations({}, agency, { startTime, endTime })
    expect(availableLocations).toEqual([{ value: 2, text: 'Location 2' }])
  })
})
