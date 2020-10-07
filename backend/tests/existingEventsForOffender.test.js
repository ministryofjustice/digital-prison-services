const existingEventsForOffenderFactory = require('../controllers/attendance/getExistingEvents')

describe('Existing events for offenders', () => {
  const elite2Api = {}
  const existingEventsService = {}
  const req = {
    originalUrl: 'http://localhost',
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
    query: {
      date: '10/10/2020',
      offenderNo: 'A12345',
    },
  }
  const res = { locals: {} }

  let logError
  let controller

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    existingEventsService.getExistingEventsForOffender = jest.fn()
    logError = jest.fn()

    res.status = jest.fn()
    res.json = jest.fn()
    res.render = jest.fn()

    controller = existingEventsForOffenderFactory({ elite2Api, existingEventsService, logError })
  })

  it('should make a call to retrieve offender details', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should make call to retrieve events for an offender', async () => {
    await controller(req, res)

    expect(existingEventsService.getExistingEventsForOffender).toHaveBeenCalledWith({}, 'LEI', '10/10/2020', 'A12345')
  })

  it('should render scheduled events template for John smith', async () => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Smith' })
    existingEventsService.getExistingEventsForOffender = jest.fn().mockResolvedValue([{ eventId: 1 }, { eventId: 2 }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 October 2020',
      events: [{ eventId: 1 }, { eventId: 2 }],
      prisonerName: 'John Smith',
      type: 'offender',
    })
  })

  it('should render scheduled events template for John jones', async () => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Jones' })
    existingEventsService.getExistingEventsForOffender = jest.fn().mockResolvedValue([{ eventId: 1 }, { eventId: 2 }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 October 2020',
      events: [{ eventId: 1 }, { eventId: 2 }],
      prisonerName: 'John Jones',
      type: 'offender',
    })
  })

  it('should log any errors and respond with an http 500 error', async () => {
    elite2Api.getDetails.mockRejectedValue(new Error('Error'))

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      new Error('Error'),
      'Error retrieving existing events for offender'
    )

    expect(res.status).toHaveBeenCalledWith(500)

    expect(res.json).toHaveBeenCalledWith({
      errorMessage: 'Error retrieving existing events for offender',
    })
  })
})
