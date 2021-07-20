import cellMoveConfirmation from '../../controllers/cellMove/cellMoveConfirmation'

describe('Cell move confirmation', () => {
  let controller
  const req = { params: { offenderNo: 'A12345' }, query: { cellId: 1 }, originalUrl: 'http://localhost' }
  let res
  const prisonApi = {}
  let logError

  beforeEach(() => {
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'Bob', lastName: 'Doe', agencyId: 'MDI' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation = jest.fn().mockResolvedValue({ description: 'A-1-012' })
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = cellMoveConfirmation({ prisonApi, logError })

    res = { locals: {}, status: jest.fn(), render: jest.fn() }
  })

  it('should make a call to retrieve an offenders details', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should make call to retrieve location details', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    expect(prisonApi.getLocation).toHaveBeenCalledWith({}, 1)
  })

  it('should store correct redirect and home url then re-throw the error', async () => {
    const offenderNo = 'A12345'
    const error = new Error('network error')

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
  })
})
