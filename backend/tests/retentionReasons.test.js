const { retentionReasonsFactory } = require('../controllers/retentionReasons')
const { serviceUnavailableMessage } = require('../common-messages')
const config = require('../config')

config.app.notmEndpointUrl = '//dpsUrl/'

describe('retention reasons', () => {
  const elite2Api = {}
  const offenderNo = 'ABC123'

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencies = jest.fn()

    controller = retentionReasonsFactory(elite2Api, logError)
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        elite2Api.getDetails.mockReturnValue({
          offenderNo,
          firstName: 'BARRY',
          lastName: 'SMITH',
          dateOfBirth: '1990-01-02',
          agencyId: 'LEI',
        })
        elite2Api.getAgencies.mockReturnValue([
          {
            agencyId: 'LEI',
            description: 'Leeds',
          },
        ])
      })

      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(elite2Api.getAgencies).toHaveBeenCalledWith(res.locals)
        expect(res.render).toHaveBeenCalledWith('retentionReasons.njk', {
          agency: 'Leeds',
          offenderUrl: 'http://localhost:3000/offenders/ABC123',
          offenderBasics: {
            offenderNo: 'ABC123',
            firstName: 'BARRY',
            lastName: 'SMITH',
            dateOfBirth: '1990-01-02',
          },
        })
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        elite2Api.getDetails.mockRejectedValue(new Error('Network error'))
      })

      it('should render the error template', async () => {
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `http://localhost:3000/offenders/${offenderNo}` })
      })
    })
  })
})
