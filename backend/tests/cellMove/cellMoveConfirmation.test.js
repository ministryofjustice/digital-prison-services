const cellMoveConfirmation = require('../../controllers/cellMove/cellMoveConfirmation')

describe('Cell move confirmation', () => {
  let controller
  const req = { params: { offenderNo: 'A12345' }, query: { cellId: 1 }, originalUrl: 'http://localhost' }
  let res
  const prisonApi = {}
  let logError

  beforeEach(() => {
    logError = jest.fn()
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'Bob', lastName: 'Doe', agencyId: 'MDI' })
    prisonApi.getLocation = jest.fn().mockResolvedValue({ description: 'A-1-012' })
    controller = cellMoveConfirmation({ prisonApi, logError })

    res = { locals: {}, status: jest.fn(), render: jest.fn() }
  })

  it('should make a call to retrieve an offenders details', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should make call to retrieve location details', async () => {
    await controller(req, res)

    expect(prisonApi.getLocation).toHaveBeenCalledWith({}, 1)
  })

  it('should render the template with the correct data', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/confirmation.njk',
      {
        breadcrumbPrisonerName: "Doe, Bob",
        dpsUrl: 'http://localhost:3000/',
        offenderNo: "A12345",
        prisonerProfileLink: "/prisoner/A12345",
        prisonerSearchLink: "/prisoner-search",
        title: "Bob Doe has been moved to cell A-1-012",
      }
    )
  })

  it('should store correct redirect and home url then re-throw the error', async () => {
    const offenderNo = 'A12345'
    const error = new Error('network error')

    prisonApi.getDetails = jest.fn().mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
  })
})
