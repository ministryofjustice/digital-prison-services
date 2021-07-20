const existingEventsForOffenderFactory = require('../controllers/attendance/getExistingEvents')

describe('Existing events for offenders', () => {
  const prisonApi = {}
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForOffender' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForOffender = jest.fn()
    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.json = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()

    controller = existingEventsForOffenderFactory({ prisonApi, existingEventsService, logError })
  })

  it('should make a call to retrieve offender details', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should make call to retrieve events for an offender', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForOffender' does not e... Remove this comment to see the full error message
    expect(existingEventsService.getExistingEventsForOffender).toHaveBeenCalledWith({}, 'LEI', '10/10/2020', 'A12345')
  })

  it('should render scheduled events template for John smith', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Smith' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForOffender' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForOffender = jest.fn().mockResolvedValue([{ eventId: 1 }, { eventId: 2 }])

    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 October 2020',
      events: [{ eventId: 1 }, { eventId: 2 }],
      prisonerName: 'John Smith',
      type: 'offender',
    })
  })

  it('should render scheduled events template for John jones', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Jones' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForOffender' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForOffender = jest.fn().mockResolvedValue([{ eventId: 1 }, { eventId: 2 }])

    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 October 2020',
      events: [{ eventId: 1 }, { eventId: 2 }],
      prisonerName: 'John Jones',
      type: 'offender',
    })
  })

  it('should log any errors and respond with an http 500 error', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockRejectedValue(new Error('Error'))

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      new Error('Error'),
      'Error retrieving existing events for offender'
    )

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(500)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: 'Error retrieving existing events for offender',
    })
  })
})
