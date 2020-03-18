const { prisonerSearchFactory } = require('../controllers/search/prisonerSearch')
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
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    oauthApi.userRoles = jest.fn()
    elite2Api.getAgencies = jest.fn().mockReturnValue([
      {
        agencyId: 'PRISON2',
        description: 'Prison 2',
      },
      {
        agencyId: 'PRISON1',
        description: 'Prison 1',
      },
    ])

    controller = prisonerSearchFactory(oauthApi, elite2Api, logError)
  })

  const agencyOptions = [
    {
      value: 'PRISON1',
      text: 'Prison 1',
    },
    {
      value: 'PRISON2',
      text: 'Prison 2',
    },
  ]

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

        expect(res.render).toHaveBeenCalledWith('prisonerSearch.njk', { agencyOptions, homeUrl: '/videolink' })
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template if there is an error retrieving user roles', async () => {
        oauthApi.userRoles.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('courtServiceError.njk', { url: '/', homeUrl: '/videolink' })
      })

      it('should render the error template if there is an error retrieving agencies', async () => {
        elite2Api.getAgencies.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('courtServiceError.njk', { url: '/', homeUrl: '/videolink' })
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
          errors: [{ text: 'Enter a name or prison number', href: '#nameOrNumber' }],
          formValues: {},
          agencyOptions,
          homeUrl: '/videolink',
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
          agencyOptions,
          homeUrl: '/videolink',
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
          agencyOptions,
          homeUrl: '/videolink',
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
          agencyOptions,
          homeUrl: '/videolink',
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
          errors: [{ text: 'Enter a date of birth which is a real date', href: '#dobDay' }, { href: '#dobError' }],
          formValues: req.body,
          agencyOptions,
          homeUrl: '/videolink',
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
          errors: [{ text: 'Enter a date of birth which is in the past', href: '#dobDay' }, { href: '#dobError' }],
          formValues: req.body,
          agencyOptions,
          homeUrl: '/videolink',
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
          agencyOptions,
          homeUrl: '/videolink',
        })
      })
    })

    describe('when the form entry is valid', () => {
      it('should submit the form correctly', async () => {
        req.body = {
          nameOrNumber: 'Test',
          dobDay: '17',
          dobMonth: '07',
          dobYear: '1980',
          prison: 'MDI',
        }

        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/prisoner-search/results?nameOrNumber=Test&dob=1980-07-17&prison=MDI'
        )
      })
    })
  })
})
