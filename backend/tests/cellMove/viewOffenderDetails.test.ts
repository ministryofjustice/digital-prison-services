import viewOffenderDetails from '../../controllers/cellMove/viewOffenderDetails'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

describe('view offender details', () => {
  let req
  let res
  let logError
  let controller

  const prisonApi = {
    getMainOffence: jest.fn(),
    getDetails: jest.fn(),
  }

  const offenderNo = 'ABC123'

  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
    age: 21,
    religion: 'Some religion',
    assignedLivingUnit: {
      description: 'A-1-12',
    },
    physicalAttributes: {
      ethnicity: 'White',
      raceCode: 'W1',
    },
    profileInformation: [
      { type: 'SEXO', resultValue: 'Heterosexual' },
      { type: 'SMOKE', resultValue: 'No' },
    ],
  }

  beforeEach(() => {
    logError = jest.fn()

    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      headers: {},
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    prisonApi.getDetails = jest.fn().mockResolvedValue(getDetailsResponse)
    prisonApi.getMainOffence = jest.fn().mockResolvedValue([
      {
        offenceDescription: '13 hours over work',
      },
    ])

    controller = viewOffenderDetails({ prisonApi, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(prisonApi.getMainOffence).toHaveBeenCalledWith(res.locals, 1234)
  })

  it('Should render error template when there is an API error', async () => {
    const error = new Error('Network error')
    prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.redirectUrl).toBe('/prisoner/ABC123/cell-move/search-for-cell')
    expect(res.locals.homeUrl).toBe('/prisoner/ABC123')
  })

  it('populates the data correctly when all present', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        prisonerName: 'User, Test',
        age: 21,
        religion: 'Some religion',
        offenderNo,
        cellLocation: 'A-1-12',
        ethnicity: 'White (W1)',
        sexualOrientation: 'Heterosexual',
        smokerOrVaper: 'No',
        mainOffence: '13 hours over work',
        backLink: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        backLinkText: 'Return to search for a cell',
        profileUrl: `/prisoner/${offenderNo}`,
      })
    )
  })

  it('populates the data correctly when optional missing', async () => {
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      ...getDetailsResponse,
      profileInformation: [],
      age: undefined,
      physicalAttributes: {},
      religion: undefined,
    })
    prisonApi.getMainOffence = jest.fn().mockResolvedValue([])
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        prisonerName: 'User, Test',
        age: 'Not entered',
        religion: 'Not entered',
        offenderNo,
        cellLocation: 'A-1-12',
        ethnicity: 'Not entered',
        sexualOrientation: 'Not entered',
        smokerOrVaper: 'Not entered',
        mainOffence: 'Not entered',
        backLink: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        backLinkText: 'Return to search for a cell',
        profileUrl: `/prisoner/${offenderNo}`,
      })
    )
  })

  it('shows a full descriotion of the location when in a temporary location', async () => {
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      ...getDetailsResponse,
      assignedLivingUnit: {
        ...getDetailsResponse.assignedLivingUnit,
        description: 'CSWAP',
      },
    })
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        cellLocation: 'No cell allocated',
      })
    )
  })

  it('sets the back link and text correctly when referer data is present', async () => {
    req = { ...req, headers: { referer: `/prisoner/${offenderNo}/cell-move/select-cell` } }
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        backLink: `/prisoner/${offenderNo}/cell-move/select-cell`,
        backLinkText: 'Return to select an available cell',
      })
    )
  })
})
