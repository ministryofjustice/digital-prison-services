const cellMoveConfirmation = require('../../controllers/cellMove/cellMoveConfirmation')

describe('Cell move confirmation', () => {
  let controller
  const req = { params: { offenderNo: 'A12345' }, query: { cellId: 1 }, originalUrl: 'http://localhost' }
  const res = { locals: {} }
  const elite2Api = {}
  let logError

  beforeEach(() => {
    logError = jest.fn()
    elite2Api.getDetails = jest.fn().mockResolvedValue({ firstName: 'Bob', lastName: 'Doe', agencyId: 'MDI' })
    elite2Api.getLocation = jest.fn().mockResolvedValue({ description: 'A-1-012' })
    controller = cellMoveConfirmation({ elite2Api, logError })

    res.render = jest.fn()
  })

  it('should make a call to retrieve an offenders details', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should make call to retrieve location details', async () => {
    await controller(req, res)

    expect(elite2Api.getLocation).toHaveBeenCalledWith({}, 1)
  })

  it('should handle api errors', async () => {
    const error = new Error('network error')
    elite2Api.getDetails = jest.fn().mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load cell move confirmation page')

    expect(res.render).toHaveBeenCalledWith('error.njk', {
      homeUrl: '/prisoner/A12345',
      url: '/prisoner/A12345/cell-move/select-location',
    })
  })
})
