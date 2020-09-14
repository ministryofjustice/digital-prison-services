const confirmCellMove = require('../../controllers/cellMove/confirmCellMove')

describe('Change cell play back details', () => {
  const elite2Api = {}

  let logError
  let controller
  const req = { originalUrl: 'http://localhost', params: { offenderNo: 'A12345' }, query: {} }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()

    elite2Api.getDetails = jest.fn().mockResolvedValue({
      firstName: 'Bob',
      lastName: 'Doe',
    })
    elite2Api.moveToCell = jest.fn()
    elite2Api.getLocation = jest.fn().mockResolvedValue({
      locationPrefix: 'MDI-10-19',
    })

    controller = confirmCellMove({ elite2Api, logError })

    req.params = {
      offenderNo: 'A12345',
    }

    res.render = jest.fn()

    res.redirect = jest.fn()
  })

  describe('Index', () => {
    it('should redirect back to select cell page when location description is missing', async () => {
      await controller.index(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
    })

    it('should make a request for the location and booking details', async () => {
      req.query = {
        cellId: 233,
      }

      await controller.index(req, res)

      expect(elite2Api.getLocation).toHaveBeenCalledWith({}, 233)
      expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
    })

    it('should render play back details page', async () => {
      req.query = { cellId: 223 }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        breadcrumbPrisonerName: 'Doe, Bob',
        cellId: 223,
        locationPrefix: 'MDI-10-19',
        name: 'Bob Doe',
        offenderNo: 'A12345',
        selectCellUrl: '/prisoner/A12345/cell-move/select-cell',
      })
    })
  })

  describe('Post', () => {
    it('should redirect back to select cell page when location description is missing', async () => {
      req.body = {}

      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
    })

    it('should call elite api to make the cell move', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({ bookingId: 1 })
      req.body = { cellId: 223 }

      await controller.post(req, res)

      expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
      expect(elite2Api.moveToCell).toHaveBeenCalledWith({}, { bookingId: 1, internalLocationDescription: 'MDI-10-19' })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirmation?cellId=223')
    })

    it('should handle api errors', async () => {
      req.body = { cellId: 223 }

      const error = new Error('network error')

      elite2Api.getDetails.mockRejectedValue(new Error('network error'))
      await controller.post(req, res)

      expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to make cell move')

      expect(res.render).toHaveBeenCalledWith(
        'error.njk',
        expect.objectContaining({
          url: '/prisoner/A12345/cell-move/select-cell',
        })
      )
    })
  })
})
