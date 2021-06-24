const inReceptionController = require('../../controllers/establishmentRoll/inReceptionController')

const inReceptionResponse = [
  {
    offenderNo: 'G7138GQ',
    bookingId: 1079935,
    dateOfBirth: '1986-12-07',
    firstName: 'Ozrashigh',
    lastName: 'Abdentine',
    toAgency: 'MDI',
    toAgencyDescription: 'Moorland (HMP & YOI)',
    fromAgency: 'HMI',
    fromAgencyDescription: 'Humber (HMP)',
    commentText: null,
    fromCity: '',
    toCity: '',
    alerts: ['XVL', 'HS', 'RKS', 'RKC', 'ROH', 'P2', 'RSS', 'XER', 'C1', 'OHCO', 'LCE', 'PVN', 'HA', 'HA2'],
    iepLevel: 'Dom Test',
    category: 'C',
  },
]

describe('In reception controller', () => {
  const movementsService = {}
  const res = { locals: {} }
  let req
  let logError
  let controller

  beforeEach(() => {
    movementsService.getOffendersInReception = jest.fn().mockResolvedValue([])
    logError = jest.fn()
    controller = inReceptionController({ movementsService, logError })

    res.render = jest.fn()
    res.status = jest.fn()
    req = {
      originalUrl: 'http://localhost',
      session: {
        userDetails: { activeCaseLoadId: 'MDI' },
      },
    }
  })

  it('should make a call to retrieve offenders in reception', async () => {
    await controller(req, res)

    expect(movementsService.getOffendersInReception).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should handle api error', async () => {
    const error = new Error('network error')

    movementsService.getOffendersInReception.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should render view with the correctly formatted data', async () => {
    movementsService.getOffendersInReception = jest.fn().mockResolvedValue(inReceptionResponse)

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('establishmentRoll/inReception.njk', {
      offenders: [
        {
          alerts: [
            {
              classes: 'alert-status alert-status--risk-to-known-adults',
              label: 'Risk to known adults',
            },
            {
              classes: 'alert-status alert-status--care-experienced',
              label: 'Care experienced',
            },
            {
              classes: 'alert-status alert-status--acct',
              label: 'ACCT open',
            },
          ],
          dateOfBirth: '07/12/1986',
          fromAgencyDescription: 'Humber (HMP)',
          iepLevel: 'Dom Test',
          name: 'Abdentine, Ozrashigh',
          offenderNo: 'G7138GQ',
          category: 'C',
        },
      ],
    })
  })

  it('should return offenders sorted alphabetically by last name', async () => {
    movementsService.getOffendersInReception = jest.fn().mockResolvedValue([
      { firstName: 'BB', lastName: 'BB', alerts: [] },
      { firstName: 'AA', lastName: 'AA', alerts: [] },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('establishmentRoll/inReception.njk', {
      offenders: [
        {
          alerts: [],
          dateOfBirth: 'Invalid date',
          fromAgencyDescription: undefined,
          iepLevel: undefined,
          name: 'Aa, Aa',
          offenderNo: undefined,
        },
        {
          alerts: [],
          dateOfBirth: 'Invalid date',
          fromAgencyDescription: undefined,
          iepLevel: undefined,
          name: 'Bb, Bb',
          offenderNo: undefined,
        },
      ],
    })
  })
})
