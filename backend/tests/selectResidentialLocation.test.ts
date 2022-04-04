import selectResidentialLocationController from '../controllers/selectResidentialLocation'

describe('Select residential location controller', () => {
  let req
  let res
  let controller

  const whereaboutsApi = {
    searchGroups: jest.fn(),
  }

  beforeEach(() => {
    req = {}
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), redirect: jest.fn() }

    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([
      { name: 'Houseblock 1', key: 'HB1', children: [] },
      { name: 'Houseblock 2', key: 'HB2', children: [] },
    ])

    controller = selectResidentialLocationController(whereaboutsApi)

    jest.spyOn(Date, 'now').mockImplementation(() => 1606471200000) // Friday, 27 November 2020 10:00:00
  })

  describe('index', () => {
    it('should makes the expected API calls', async () => {
      await controller.index(req, res)

      expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith(res.locals, 'MDI')
    })

    it('should render the correct template with the correct data', async () => {
      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('selectResidentialLocation.njk', {
        date: '27/11/2020',
        errors: undefined,
        period: 'AM',
        residentialLocations: [
          { text: 'Houseblock 1', value: 'HB1' },
          { text: 'Houseblock 2', value: 'HB2' },
        ],
      })
    })

    describe('when there is an error retrieving data', () => {
      it('should set correct redirect url and throw error', async () => {
        const error = new Error('Network error')
        whereaboutsApi.searchGroups = jest.fn().mockRejectedValue(error)

        await expect(controller.index(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe('/manage-prisoner-whereabouts')
      })
    })
  })

  describe('post', () => {
    describe('when there are form errors', () => {
      it('should re render with errors when there is no location selected but maintain selected values', async () => {
        req.body = { period: 'PM', date: '30/11/2020' }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'selectResidentialLocation.njk',
          expect.objectContaining({
            date: '30/11/2020',
            errors: [{ text: 'Select a location', href: '#currentLocation' }],
            period: 'PM',
          })
        )
      })
    })

    describe('when there are no form errors', () => {
      it('should redirect to correct url when there are no errors', async () => {
        req.body = { period: 'PM', date: '30/11/2020', currentLocation: 'HB1' }

        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/manage-prisoner-whereabouts/housing-block-results?currentLocation=HB1&date=30/11/2020&period=PM'
        )
      })
    })
  })
})
