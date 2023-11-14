import temporaryMoveController from '../../controllers/cellMove/cellMoveTemporaryMove'

describe('Move someone temporarily out of a cell', () => {
  const prisonApi = {
    getInmates: jest.fn(),
  }
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/change-someones-cell/temporary-move',
      query: {},
      body: {},
      session: { userDetails: { username: 'me' } },
    }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        responseHeaders: {
          'total-records': 0,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    }

    prisonApi.getInmates = jest.fn().mockReturnValue([])
    systemOauthClient.getClientCredentialsTokens.mockResolvedValue({})

    controller = temporaryMoveController({ systemOauthClient, prisonApi })
  })

  describe('index', () => {
    it('should make make a call to get inmates using current active caseload and the specified search terms', async () => {
      req.query = {
        keywords: 'Smith',
      }

      await controller(req, res)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(
        {
          requestHeaders: expect.objectContaining({
            'Page-Limit': '5000',
            'Sort-Fields': 'lastName,firstName',
            'Sort-Order': 'ASC',
          }),
        },
        'MDI',
        {
          keywords: 'Smith',
        }
      )
    })

    it('should render template with correct data when searched', async () => {
      const inmates = [
        {
          bookingId: 1,
          offenderNo: 'A1234BC',
          firstName: 'JOHN',
          lastName: 'SMITH',
          dateOfBirth: '1990-10-12',
          age: 29,
          agencyId: 'MDI',
          assignedLivingUnitId: 1,
          assignedLivingUnitDesc: 'UNIT-1',
          iepLevel: 'Standard',
          categoryCode: 'C',
          alertsDetails: ['XA', 'XVL'],
        },
        {
          bookingId: 2,
          offenderNo: 'B4567CD',
          firstName: 'STEVE',
          lastName: 'SMITH',
          dateOfBirth: '1989-11-12',
          age: 30,
          agencyId: 'MDI',
          assignedLivingUnitId: 2,
          assignedLivingUnitDesc: 'CSWAP',
          iepLevel: 'Standard',
          categoryCode: 'C',
          alertsDetails: ['RSS', 'XC'],
        },
      ]
      prisonApi.getInmates = jest.fn().mockReturnValue(inmates)

      req.query = {
        keywords: 'Smith',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveTemporaryMove.njk',
        expect.objectContaining({
          showResults: true,
          showHelp: false,
          results: [
            {
              age: 29,
              agencyId: 'MDI',
              alertsDetails: ['XA', 'XVL'],
              assignedLivingUnitDesc: 'UNIT-1',
              assignedLivingUnitId: 1,
              bookingId: 1,
              categoryCode: 'C',
              dateOfBirth: '1990-10-12',
              firstName: 'JOHN',
              iepLevel: 'Standard',
              lastName: 'SMITH',
              name: 'Smith, John',
              formattedName: 'John Smith',
              offenderNo: 'A1234BC',
              cellHistoryUrl: `/prisoner/A1234BC/cell-history`,
              cellMoveUrl: `/prisoner/A1234BC/cell-move/confirm-cell-move?cellId=C-SWAP`,
            },
            {
              age: 30,
              agencyId: 'MDI',
              alertsDetails: ['RSS', 'XC'],
              assignedLivingUnitDesc: 'No cell allocated',
              assignedLivingUnitId: 2,
              bookingId: 2,
              categoryCode: 'C',
              dateOfBirth: '1989-11-12',
              firstName: 'STEVE',
              iepLevel: 'Standard',
              lastName: 'SMITH',
              name: 'Smith, Steve',
              formattedName: 'Steve Smith',
              offenderNo: 'B4567CD',
              cellHistoryUrl: `/prisoner/B4567CD/cell-history`,
              cellMoveUrl: `/prisoner/B4567CD/cell-move/confirm-cell-move?cellId=C-SWAP`,
            },
          ],
          totalOffenders: 2,
        })
      )
    })

    it('should render template without results but with help when not searched', async () => {
      req.query = {}

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveTemporaryMove.njk',
        expect.objectContaining({
          showResults: false,
          showHelp: true,
          errors: [],
        })
      )
    })

    it('should render template with error and without help when searched without keywords', async () => {
      req.query = {
        keywords: '',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveTemporaryMove.njk',
        expect.objectContaining({
          showResults: false,
          showHelp: false,
          errors: [
            {
              href: '#keywords',
              text: 'Enter a prisoner’s name or number',
            },
          ],
        })
      )
    })
  })
})
