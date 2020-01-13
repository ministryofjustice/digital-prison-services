const { prisonerSearchFactory } = require('../controllers/prisonerSearch')
const { serviceUnavailableMessage } = require('../common-messages')

describe('Prisoner search', () => {
  const elite2Api = {}
  const oauthApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn(), send: jest.fn() }

    logError = jest.fn()

    oauthApi.userRoles = jest.fn()

    controller = prisonerSearchFactory(oauthApi, elite2Api, logError)
  })

  describe('index', () => {
    describe('when the user does not have the correct roles', () => {
      it('should redirect back', async () => {
        oauthApi.userRoles.mockReturnValue([])

        await controller.index(req, res)

        expect(res.redirect).toHaveBeenCalledWith('back')
      })
    })

    describe('when the user does have the correct roles', () => {
      it('should render the prisoner search template', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])

        await controller.index(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {})
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template', async () => {
        oauthApi.userRoles.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/' })
      })
    })
  })

  describe('post', () => {
    beforeEach(() => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])
    })

    describe('with an empty form', () => {
      it('should display the correct errors', async () => {
        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Enter prisoner name or number', href: '#nameOrNumber' }],
          formValues: {},
        })
      })
    })

    describe('date of birth validation', () => {
      it('should error when missing the day', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobMonth: '07',
          dobYear: '1987',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Date of birth must include a day', href: '#dobDay' }],
          formValues: req.body,
        })
      })

      it('should error when missing the month', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '17',
          dobYear: '1987',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Date of birth must include a month', href: '#dobMonth' }],
          formValues: req.body,
        })
      })

      it('should error when missing the year', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '17',
          dobMonth: '07',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Date of birth must include a year', href: '#dobYear' }],
          formValues: req.body,
        })
      })

      it('should error not a valid date', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '32',
          dobMonth: '13',
          dobYear: '1987',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Enter a real date of birth', href: '#dobDay' }, { href: '#dobError' }],
          formValues: req.body,
        })
      })

      it('should error when the date is in the future', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

        req.body = {
          nameOrNumber: 'Test',
          dobDay: '30',
          dobMonth: '03',
          dobYear: '2019',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Date of birth must be in the past', href: '#dobDay' }, { href: '#dobError' }],
          formValues: req.body,
        })

        Date.now.mockRestore()
      })

      it('should error when the date too far in the past', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '17',
          dobMonth: '07',
          dobYear: '1899',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', {
          errors: [{ text: 'Date of birth must be after 1900', href: '#dobDay' }, { href: '#dobError' }],
          formValues: req.body,
        })
      })
    })

    // Complete as part of NN-2319
    describe('when the form entry is valid', () => {
      it('should submit the form correctly', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '17',
          dobMonth: '07',
          dobYear: '1980',
        }

        await controller.post(req, res)

        expect(res.send).toHaveBeenCalledWith({ nameOrNumber: 'Test', dob: '1980-07-17', prison: undefined })
      })
    })
  })
})
