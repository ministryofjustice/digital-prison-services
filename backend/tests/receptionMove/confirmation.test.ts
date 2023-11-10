import confirmation from '../../controllers/receptionMove/confirmation'

const someOffenderNumber = 'A12345'

const prisonApi = {
  getDetails: jest.fn(),
}

const res = { locals: {}, status: jest.fn(), render: jest.fn() }
let req
let controller

describe('Reception move confirmation', () => {
  beforeEach(() => {
    prisonApi.getDetails.mockResolvedValue({
      offenderNo: someOffenderNumber,
      firstName: 'John',
      lastName: 'Doe',
    })

    req = {
      params: {
        offenderNo: someOffenderNumber,
      },
    }

    controller = confirmation(prisonApi)
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
      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/confirmation.njk',
        expect.objectContaining({
          offenderNo: 'A12345',
          confirmationMessage: 'John Doe has been moved to reception',
          profileUrl: '/prisoner/A12345',
        })
      )
    })
  })
})
