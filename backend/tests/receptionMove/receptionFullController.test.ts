import receptionFullController from '../../controllers/receptionMove/receptionFull'

const someOffenderNumber = 'A12345'

const prisonApi = {
  getDetails: jest.fn(),
}

const res = { locals: {}, redirect: jest.fn(), render: jest.fn() }
let req
let controller

describe('Reception full', () => {
  beforeEach(() => {
    prisonApi.getDetails.mockResolvedValue({
      offenderNo: someOffenderNumber,
      firstName: 'John ',
      lastName: 'Doe',
    })

    req = {
      headers: { referer: 'refering-url' },
      params: {
        offenderNo: someOffenderNumber,
      },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
    }

    controller = receptionFullController(prisonApi)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('page', () => {
    it('should make the correct api calls', async () => {
      await controller.view(req, res)
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, someOffenderNumber, false)
    })

    it('should render with correct data', async () => {
      await controller.view(req, res)
      expect(res.render).toHaveBeenCalledWith('receptionMoves/receptionFull.njk', {
        offenderName: 'John  Doe',
        offenderNo: 'A12345',
        backUrl: 'refering-url',
        locationDetailsUrl: 'http://localhost:3000/prisoner/A12345/location-details',
      })
    })
  })
})
