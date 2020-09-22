const confirmCellMove = require('../../controllers/cellMove/confirmCellMove')
const { makeError } = require('../helpers')

const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

jest.mock('../../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Change cell play back details', () => {
  const elite2Api = {}

  let logError
  let controller
  const req = { originalUrl: 'http://localhost', params: { offenderNo: 'A12345' }, query: {} }
  const res = { locals: {} }

  beforeEach(() => {
    jest.clearAllMocks()
    logError = jest.fn()

    elite2Api.getDetails = jest.fn().mockResolvedValue({
      bookingId: 1,
      firstName: 'Bob',
      lastName: 'Doe',
      agencyId: 'MDI',
    })
    elite2Api.moveToCell = jest.fn()
    elite2Api.moveToCellSwap = jest.fn()
    elite2Api.getLocation = jest.fn().mockResolvedValue({
      locationPrefix: 'MDI-10-19',
      description: 'MDI-10',
    })

    elite2Api.getAttributesForLocation = jest.fn().mockResolvedValue({ capacity: 1 })

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
        description: 'MDI-10',
        locationPrefix: 'MDI-10-19',
        name: 'Bob Doe',
        offenderNo: 'A12345',
        selectCellUrl: '/prisoner/A12345/cell-move/select-cell',
        showWarning: true,
      })
    })

    it('should not make a request for the location details when the cell is C-SWAP', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      expect(elite2Api.getLocation.mock.calls.length).toBe(0)
    })

    it('should render view model with C-SWAP title and warnings disabled', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        breadcrumbPrisonerName: 'Doe, Bob',
        cellId: 'C-SWAP',
        description: 'swap',
        locationPrefix: undefined,
        name: 'Bob Doe',
        offenderNo: 'A12345',
        selectCellUrl: '/prisoner/A12345/cell-move/select-cell',
        showWarning: false,
      })
    })
  })

  describe('Post handle normal cell move', () => {
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

      expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to make cell move to 223')

      expect(res.render).toHaveBeenCalledWith(
        'error.njk',
        expect.objectContaining({
          url: '/prisoner/A12345/cell-move/select-cell',
        })
      )
    })

    it('should raise an analytics event', async () => {
      req.body = { cellId: 223 }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - Single occupancy')
    })

    it('should not raise an analytics event on api failures', async () => {
      elite2Api.moveToCell.mockRejectedValue(new Error('Internal server error'))
      req.body = { cellId: 123 }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })

    it('should redirect to cell not available on a http 400 bad request when attempting a cell move', async () => {
      req.body = { cellId: 223 }

      elite2Api.moveToCell.mockRejectedValue(makeError('status', 400))

      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/cell-not-available?cellDescription=MDI-10')
      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
      expect(logError.mock.calls.length).toBe(0)
    })

    it('should redirect to error page when the cell is no longer available', () => {})
  })

  describe('Post handle C-SWAP cell move', () => {
    it('should call elite api to make the C-SWAP cell move', async () => {
      req.body = { cellId: 'C-SWAP' }

      await controller.post(req, res)

      expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
      expect(elite2Api.moveToCellSwap).toHaveBeenCalledWith({}, { bookingId: 1 })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/cswap-confirmation')
    })

    it('should raise an analytics event', async () => {
      req.body = { cellId: 'C-SWAP' }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - C-SWAP')
    })

    it('should not raise an analytics event on api failures', async () => {
      elite2Api.moveToCellSwap.mockRejectedValue(new Error('Internal server error'))
      req.body = { cellId: 'C-SWAP' }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })
  })
})
