import selectActivityLocationController from '../controllers/selectActivityLocation'
import { makeResetError } from './helpers'

describe('Select activity locations controller', () => {
  const agencyId = 'MDI'
  const prisonApi = {
    searchActivityLocations: jest.fn(),
  }
  let controller
  let req
  let res

  beforeEach(() => {
    prisonApi.searchActivityLocations = jest.fn()

    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: agencyId } },
        homeUrl: '/',
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }
    req = {
      flash: jest.fn(),
      originalUrl: 'http://localhost:8080',
    }

    controller = selectActivityLocationController({ prisonApi })

    jest.spyOn(Date, 'now').mockImplementation(() => 1595548800000) // Friday, 24 July 2020 00:00:00
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('Index', () => {
    it('should use default values when there are no query parameters', async () => {
      await controller.index(req, res)

      expect(prisonApi.searchActivityLocations).toHaveBeenCalledWith(res.locals, agencyId, '2020-07-24', 'AM')
    })

    it('should use query parameters', async () => {
      req.query = {
        date: '10/12/2020',
        period: 'PM',
      }

      await controller.index(req, res)

      expect(prisonApi.searchActivityLocations).toHaveBeenCalledWith(res.locals, agencyId, '2020-12-10', 'PM')
    })

    it('should render correct data with no query parameters', async () => {
      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('selectActivityLocation.njk', {
        date: '24/07/2020',
        locationDropdownValues: undefined,
        period: 'AM',
      })
    })

    it('should render correct data using the query parameters', async () => {
      prisonApi.searchActivityLocations = jest.fn().mockResolvedValue([
        {
          locationId: 1,
          userDescription: 'Location 1',
        },
      ])

      req.query = {
        date: '10/12/2020',
        period: 'PM',
      }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('selectActivityLocation.njk', {
        date: '10/12/2020',
        locationDropdownValues: [{ text: 'Location 1', value: 1 }],
        period: 'PM',
      })
    })

    it.skip('should set redirect and throw error', async () => {
      res.locals = {}
      const error = new Error('Network error')
      prisonApi.searchActivityLocations.mockRejectedValue(error)

      await expect(controller.index(req, res)).rejects.toThrowError

      expect(res.locals.redirectUrl).toBe(`/manage-prisoner-whereabouts`)
    })

    describe('When there is a timeout error', () => {
      beforeEach(() => {
        const connectionResetError = makeResetError()
        prisonApi.searchActivityLocations.mockRejectedValue(connectionResetError)
      })
      it('should render error template using the req.originalUrl as the redirect url', async () => {
        await controller.index(req, res)

        expect(res.render).toHaveBeenCalledWith('error.njk', { homeUrl: '/', url: 'http://localhost:8080' })
      })

      it('should render error template using the res.redirectUrl as the redirect url', async () => {
        req.originalUrl = null
        res.locals.redirectUrl = 'http://localhost:9090'
        await controller.index(req, res)

        expect(res.render).toHaveBeenCalledWith('error.njk', { homeUrl: '/', url: 'http://localhost:9090' })
      })
    })
  })

  describe('Post', () => {
    it('show validation message for missing location', async () => {
      req.body = { date: '10/10/2020', period: 'PM' }
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        '/manage-prisoner-whereabouts/select-location?date=10/10/2020&period=PM'
      )
    })

    it('should redirect to activity lists with the correct query string parameters', async () => {
      req.body = { date: '10/10/2020', period: 'AM', currentLocation: 1 }
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        `/manage-prisoner-whereabouts/activity-results?location=1&date=10/10/2020&period=AM`
      )
    })
  })
})
