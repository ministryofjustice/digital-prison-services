const getLocationExistingEventsFactory = require('../controllers/attendance/getLocationExistingEvents')

describe('Get location existing events', () => {
  const prisonApi = {}
  const existingEventsService = {}
  let controller
  let logError

  const req = {
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
  }
  const res = {
    locals: {},
  }

  beforeEach(() => {
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForLocation = jest.fn()

    controller = getLocationExistingEventsFactory({ prisonApi, existingEventsService, logError })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.json = jest.fn()
  })

  it('should make a call to retrieve locations using the location id', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type '{ session... Remove this comment to see the full error message
    req.query = {
      locationId: 1,
      date: '10/12/2020',
    }
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    expect(prisonApi.getLocation).toHaveBeenCalledWith({}, 1)
  })

  it('should make a call to retrieve events at a location', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
    expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/12/2020')
  })

  it('should render template with correct view model', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation = jest.fn().mockReturnValue({
      userDescription: 'Gym',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForLocation = jest.fn().mockReturnValue([{ eventId: 1 }, { eventId: 2 }])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type '{ session... Remove this comment to see the full error message
    req.query = {
      locationId: 1,
      date: '10/12/2020',
    }

    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 December 2020',
      header: 'Schedule for Gym',
      events: [{ eventId: 1 }, { eventId: 2 }],
      type: 'location',
    })
  })
})
