const getLocationExistingEventsFactory = require('../controllers/attendance/getLocationExistingEvents')

describe('Get location existing events', () => {
  const elite2Api = {}
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
    elite2Api.getLocation = jest.fn()
    existingEventsService.getExistingEventsForLocation = jest.fn()

    controller = getLocationExistingEventsFactory({ elite2Api, existingEventsService, logError })

    res.render = jest.fn()
    res.status = jest.fn()
    res.json = jest.fn()
  })

  it('should make a call to retrieve locations using the location id', async () => {
    req.query = {
      locationId: 1,
      date: '10/12/2020',
    }
    await controller(req, res)

    expect(elite2Api.getLocation).toHaveBeenCalledWith({}, 1)
  })

  it('should make a call to retrieve events at a location', async () => {
    await controller(req, res)

    expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/12/2020')
  })

  it('should render template with correct view model', async () => {
    elite2Api.getLocation = jest.fn().mockReturnValue({
      userDescription: 'Gym',
    })

    existingEventsService.getExistingEventsForLocation = jest.fn().mockReturnValue([{ eventId: 1 }, { eventId: 2 }])

    req.query = {
      locationId: 1,
      date: '10/12/2020',
    }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      date: '10 December 2020',
      header: 'Schedule for Gym',
      events: [{ eventId: 1 }, { eventId: 2 }],
      type: 'location',
    })
  })
})
