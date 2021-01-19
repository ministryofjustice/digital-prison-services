const confirmCellMove = require('../../controllers/cellMove/confirmCellMove')
const { makeError } = require('../helpers')

const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

jest.mock('../../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Change cell play back details', () => {
  const prisonApi = {}
  const whereaboutsApi = {}
  const caseNotesApi = {}

  let logError
  let controller
  const req = { originalUrl: 'http://localhost', params: { offenderNo: 'A12345' }, query: {} }
  const res = { locals: {}, status: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    logError = jest.fn()

    prisonApi.getDetails = jest.fn().mockResolvedValue({
      bookingId: 1,
      firstName: 'Bob',
      lastName: 'Doe',
      agencyId: 'MDI',
    })
    whereaboutsApi.moveToCell = jest.fn()
    prisonApi.moveToCellSwap = jest.fn()
    prisonApi.getLocation = jest.fn().mockResolvedValue({
      locationPrefix: 'MDI-10-19',
      description: 'MDI-10',
    })

    prisonApi.getAttributesForLocation = jest.fn().mockResolvedValue({ capacity: 1 })
    caseNotesApi.getCaseNoteTypes = jest.fn().mockResolvedValue([])

    controller = confirmCellMove({ prisonApi, whereaboutsApi, logError, caseNotesApi })

    req.params = {
      offenderNo: 'A12345',
    }

    res.render = jest.fn()
    res.redirect = jest.fn()
    req.flash = jest.fn()
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

      expect(prisonApi.getLocation).toHaveBeenCalledWith({}, 233)
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
    })

    it('should render play back details page', async () => {
      req.query = { cellId: 223 }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        dpsUrl: 'http://localhost:3000/',
        errors: undefined,
        formValues: {
          comment: undefined,
          reason: undefined,
        },
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

      expect(prisonApi.getLocation.mock.calls.length).toBe(0)
    })

    it('should render view model with C-SWAP title and warnings disabled', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        breadcrumbPrisonerName: 'Doe, Bob',
        cellId: 'C-SWAP',
        cellMoveReasonRadioValues: undefined,
        description: 'swap',
        dpsUrl: 'http://localhost:3000/',
        errors: undefined,
        formValues: {
          comment: undefined,
        },
        locationPrefix: undefined,
        name: 'Bob Doe',
        offenderNo: 'A12345',
        selectCellUrl: '/prisoner/A12345/cell-move/select-cell',
        showWarning: false,
      })
    })

    it('should not make a request for case note types when moving to C-SWAP', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      expect(caseNotesApi.getCaseNoteTypes.mock.calls.length).toBe(0)
    })

    it('should make a request to retrieve all cell move case note types for none c-swap moves', async () => {
      req.query = { cellId: 'A-1-3' }

      caseNotesApi.getCaseNoteTypes.mockResolvedValue([
        {
          code: 'MOVED_CELL',
          subCodes: [{ code: 'ADM', description: 'Admin' }, { code: 'SA', description: 'Safety' }],
        },
      ])

      await controller.index(req, res)

      expect(caseNotesApi.getCaseNoteTypes).toHaveBeenCalledWith({})
      expect(res.render).toHaveBeenCalledWith(
        'cellMove/confirmCellMove.njk',
        expect.objectContaining({
          cellMoveReasonRadioValues: [
            { value: 'ADM', text: 'Admin', checked: false },
            { value: 'SA', text: 'Safety', checked: false },
          ],
        })
      )
    })

    it('should unpack errors out of req.flash', async () => {
      req.flash.mockImplementation(() => [
        {
          href: '#reason',
          text: 'Select the reason for the cell move',
        },
      ])
      req.query = { cellId: 'A-1-3' }

      await controller.index(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'cellMove/confirmCellMove.njk',
        expect.objectContaining({
          errors: [{ href: '#reason', text: 'Select the reason for the cell move' }],
        })
      )
    })

    it('should unpack form values out of req.flash', async () => {
      caseNotesApi.getCaseNoteTypes.mockResolvedValue([
        {
          code: 'MOVED_CELL',
          subCodes: [{ code: 'ADM', description: 'Admin' }, { code: 'SA', description: 'Safety' }],
        },
      ])
      req.flash.mockImplementation(() => [
        {
          reason: 'ADM',
          comment: 'Hello',
        },
      ])
      req.query = { cellId: 'A-1-3' }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/confirmCellMove.njk',
        expect.objectContaining({
          cellMoveReasonRadioValues: [
            { checked: true, text: 'Admin', value: 'ADM' },
            { checked: false, text: 'Safety', value: 'SA' },
          ],
          formValues: {
            comment: 'Hello',
          },
        })
      )
    })
  })

  describe('Post handle normal cell move', () => {
    beforeEach(() => {
      req.body = { reason: 'ADM', comment: 'Hello world' }
    })

    it('should trigger missing reason validation', async () => {
      req.body = { cellId: 233, comment: 'hello world' }

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#reason',
          text: 'Select the reason for the cell move',
        },
      ])

      expect(req.flash).toHaveBeenCalledWith('formValues', {
        comment: 'hello world',
      })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger missing comment validation', async () => {
      req.body = { cellId: 233, reason: 'ADM' }

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('formValues', { comment: undefined, reason: 'ADM' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter what happened for you to change this person’s cell',
        },
      ])

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger minimum comment length validation', async () => {
      req.body = { cellId: 233, comment: 'hello', reason: 'ADM' }

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter a real explanation of what happened for you to change this person’s cell',
        },
      ])

      expect(req.flash).toHaveBeenCalledWith('formValues', {
        reason: 'ADM',
        comment: 'hello',
      })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger the maximum comment length validation', async () => {
      const bigComment = [...Array(40001).keys()].map(() => 'A').join('')

      req.body = { cellId: 233, comment: bigComment, reason: 'ADM' }

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter what happened for you to change this person’s cell using 4,000 characters or less',
        },
      ])

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should redirect back to select cell page when location description is missing', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
    })

    it('should call whereabouts api to make the cell move', async () => {
      prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId: 1 })
      req.body = { reason: 'BEH', cellId: 223, comment: 'Hello world' }

      await controller.post(req, res)

      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
      expect(whereaboutsApi.moveToCell).toHaveBeenCalledWith(
        {},
        {
          bookingId: 1,
          offenderNo: 'A12345',
          cellMoveReasonCode: 'BEH',
          commentText: 'Hello world',
          internalLocationDescriptionDestination: 'MDI-10-19',
        }
      )
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirmation?cellId=223')
    })

    it('should store correct redirect and home url then re-throw the error', async () => {
      req.body = { ...req.body, cellId: 223 }
      const offenderNo = 'A12345'
      const error = new Error('network error')

      prisonApi.getDetails = jest.fn().mockRejectedValue(error)

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/select-cell`)
      expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
    })

    it('should raise an analytics event', async () => {
      req.body = { ...req.body, cellId: 223 }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - Single occupancy')
    })

    it('should not raise an analytics event on api failures', async () => {
      const error = new Error('Internal server error')
      whereaboutsApi.moveToCell.mockRejectedValue(error)

      req.body = { ...req.body, cellId: 123 }

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })

    it('should redirect to cell not available on a http 400 bad request when attempting a cell move', async () => {
      req.body = { ...req.body, cellId: 223 }

      whereaboutsApi.moveToCell.mockRejectedValue(makeError('status', 400))

      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/cell-not-available?cellDescription=MDI-10')
      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
      expect(logError.mock.calls.length).toBe(0)
    })
  })

  describe('Post handle C-SWAP cell move', () => {
    it('should call elite api to make the C-SWAP cell move', async () => {
      req.body = { cellId: 'C-SWAP' }
      res.locals = {}

      await controller.post(req, res)

      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
      expect(prisonApi.moveToCellSwap).toHaveBeenCalledWith({}, { bookingId: 1 })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/cswap-confirmation')
    })

    it('should raise an analytics event', async () => {
      req.body = { cellId: 'C-SWAP' }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - C-SWAP')
    })

    it('should not raise an analytics event on api failures', async () => {
      const error = new Error('Internal server error')

      prisonApi.moveToCellSwap.mockRejectedValue(error)
      req.body = { cellId: 'C-SWAP' }

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })
  })
})
