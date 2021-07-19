const confirmCellMove = require('../../controllers/cellMove/confirmCellMove')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'makeError'... Remove this comment to see the full error message
const { makeError } = require('../helpers')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'raiseAnaly... Remove this comment to see the full error message
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
  const req = { originalUrl: 'http://localhost', params: { offenderNo: 'A12345' }, query: {}, headers: {} }
  const res = { locals: {}, status: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      bookingId: 1,
      firstName: 'Bob',
      lastName: 'Doe',
      agencyId: 'MDI',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCell' does not exist on type '{}'.
    whereaboutsApi.moveToCell = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCellSwap' does not exist on type '... Remove this comment to see the full error message
    prisonApi.moveToCellSwap = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation = jest.fn().mockResolvedValue({
      locationPrefix: 'MDI-10-19',
      description: 'MDI-10',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttributesForLocation' does not exist... Remove this comment to see the full error message
    prisonApi.getAttributesForLocation = jest.fn().mockResolvedValue({ capacity: 1 })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
    prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue([])

    controller = confirmCellMove({ prisonApi, whereaboutsApi, logError, caseNotesApi })

    req.params = {
      offenderNo: 'A12345',
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    res.redirect = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
    req.flash = jest.fn()
  })

  describe('Index', () => {
    it('should redirect back to select cell page when location description is missing', async () => {
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
    })

    it('should make a request for the location and booking details', async () => {
      req.query = {
        cellId: 233,
      }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
      expect(prisonApi.getLocation).toHaveBeenCalledWith({}, 233)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
    })

    it('should render play back details page', async () => {
      req.query = { cellId: 223 }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        backLink: '/prisoner/A12345/cell-move/search-for-cell',
        backLinkText: 'Cancel',
        errors: undefined,
        formValues: {
          comment: undefined,
          reason: undefined,
        },
        breadcrumbPrisonerName: 'Doe, Bob',
        cellId: 223,
        cellMoveReasonRadioValues: [],
        movingToHeading: 'to cell MDI-10',
        locationPrefix: 'MDI-10-19',
        name: 'Bob Doe',
        offenderNo: 'A12345',
        showCommentInput: true,
        showWarning: true,
      })
    })

    it('should not make a request for the location details when the cell is C-SWAP', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
      expect(prisonApi.getLocation.mock.calls.length).toBe(0)
    })

    it('should render view model with C-SWAP title and warnings disabled', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith('cellMove/confirmCellMove.njk', {
        backLink: '/prisoner/A12345/cell-move/search-for-cell',
        backLinkText: 'Cancel',
        breadcrumbPrisonerName: 'Doe, Bob',
        cellId: 'C-SWAP',
        cellMoveReasonRadioValues: undefined,
        movingToHeading: 'out of their current location',
        errors: undefined,
        formValues: {
          comment: undefined,
        },
        locationPrefix: undefined,
        name: 'Bob Doe',
        offenderNo: 'A12345',
        showCommentInput: false,
        showWarning: false,
      })
    })

    it('should not make a request for case note types when moving to C-SWAP', async () => {
      req.query = { cellId: 'C-SWAP' }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getCellMoveReasonTypes.mock.calls.length).toBe(0)
    })

    it('should make a request to retrieve all cell move case note types for none c-swap moves', async () => {
      req.query = { cellId: 'A-1-3' }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes.mockResolvedValue([
        {
          code: 'ADM',
          description: 'Admin',
          activeFlag: 'Y',
        },
        {
          code: 'SA',
          description: 'Safety',
          activeFlag: 'Y',
        },
        {
          code: 'UNUSED',
          description: 'Unused value',
          activeFlag: 'N',
        },
      ])

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getCellMoveReasonTypes).toHaveBeenCalledWith({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [
        {
          href: '#reason',
          text: 'Select the reason for the cell move',
        },
      ])
      req.query = { cellId: 'A-1-3' }

      await controller.index(req, res)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'cellMove/confirmCellMove.njk',
        expect.objectContaining({
          errors: [{ href: '#reason', text: 'Select the reason for the cell move' }],
        })
      )
    })

    it('should unpack form values out of req.flash', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes.mockResolvedValue([
        {
          code: 'ADM',
          description: 'Admin',
          activeFlag: 'Y',
        },
        {
          code: 'SA',
          description: 'Safety',
          activeFlag: 'Y',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [
        {
          reason: 'ADM',
          comment: 'Hello',
        },
      ])
      req.query = { cellId: 'A-1-3' }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
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

    it('should show cell move reasons in Db order', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes.mockResolvedValue([
        {
          code: 'ADM',
          description: 'Admin',
          listSeq: 2,
          activeFlag: 'Y',
        },
        {
          code: 'SA',
          description: 'Safety',
          listSeq: 1,
          activeFlag: 'Y',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [
        {
          reason: 'ADM',
          comment: 'Hello',
        },
      ])
      req.query = { cellId: 'A-1-3' }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'cellMove/confirmCellMove.njk',
        expect.objectContaining({
          cellMoveReasonRadioValues: [
            { checked: false, text: 'Safety', value: 'SA' },
            { checked: true, text: 'Admin', value: 'ADM' },
          ],
          formValues: {
            comment: 'Hello',
          },
        })
      )
    })

    test.each`
      referer                                                   | backLinkText
      ${'/prisoner/A12345/cell-move/select-cell'}               | ${'Select another cell'}
      ${'/prisoner/A12345/cell-move/consider-risks'}            | ${'Select another cell'}
      ${'/prisoner/A12345/cell-move/search-for-cell'}           | ${'Cancel'}
      ${'/change-someones-cell/temporary-move?keywords=A12345'} | ${'Cancel'}
    `(
      'The back link button content is $backLinkText when the referer is $referer',
      async ({ referer, backLinkText }) => {
        req.headers = { referer }

        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'cellMove/confirmCellMove.njk',
          expect.objectContaining({
            backLink:
              referer === '/prisoner/A12345/cell-move/consider-risks'
                ? '/prisoner/A12345/cell-move/select-cell'
                : referer,
            backLinkText,
          })
        )
      }
    )
  })

  describe('Post handle normal cell move', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { reason: 'ADM', comment: 'Hello world' }
    })

    it('should trigger missing reason validation', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 233, comment: 'hello world' }

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#reason',
          text: 'Select the reason for the cell move',
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('formValues', {
        comment: 'hello world',
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger missing comment validation', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 233, reason: 'ADM' }

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('formValues', { comment: undefined, reason: 'ADM' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter what happened for you to change this person’s cell',
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger minimum comment length validation', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 233, comment: 'hello', reason: 'ADM' }

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter a real explanation of what happened for you to change this person’s cell',
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('formValues', {
        reason: 'ADM',
        comment: 'hello',
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should trigger the maximum comment length validation', async () => {
      const bigComment = [...Array(40001).keys()].map(() => 'A').join('')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 233, comment: bigComment, reason: 'ADM' }

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#comment',
          text: 'Enter what happened for you to change this person’s cell using 4,000 characters or less',
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirm-cell-move?cellId=233')
    })

    it('should redirect back to select cell page when location description is missing', async () => {
      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
    })

    it('should call whereabouts api to make the cell move', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId: 1 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { reason: 'BEH', cellId: 223, comment: 'Hello world' }

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCell' does not exist on type '{}'.
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/confirmation?cellId=223')
    })

    it('should store correct redirect and home url then re-throw the error', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { ...req.body, cellId: 223 }
      const offenderNo = 'A12345'
      const error = new Error('network error')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails = jest.fn().mockRejectedValue(error)

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/select-cell`)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'homeUrl' does not exist on type '{}'.
      expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
    })

    it('should raise an analytics event', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { ...req.body, cellId: 223 }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - Single occupancy')
    })

    it('should not raise an analytics event on api failures', async () => {
      const error = new Error('Internal server error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCell' does not exist on type '{}'.
      whereaboutsApi.moveToCell.mockRejectedValue(error)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { ...req.body, cellId: 123 }

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(category:... Remove this comment to see the full error message
      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })

    it('should redirect to cell not available on a http 400 bad request when attempting a cell move', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { ...req.body, cellId: 223 }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCell' does not exist on type '{}'.
      whereaboutsApi.moveToCell.mockRejectedValue(makeError('status', 400))

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/cell-not-available?cellDescription=MDI-10')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(category:... Remove this comment to see the full error message
      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
      expect(logError.mock.calls.length).toBe(0)
    })
  })

  describe('Post handle C-SWAP cell move', () => {
    it('should call elite api to make the C-SWAP cell move', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 'C-SWAP' }
      res.locals = {}

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCellSwap' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.moveToCellSwap).toHaveBeenCalledWith({}, { bookingId: 1 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/space-created')
    })

    it('should raise an analytics event', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 'C-SWAP' }

      await controller.post(req, res)

      expect(raiseAnalyticsEvent).toBeCalledWith('Cell move', 'Cell move for MDI', 'Cell type - C-SWAP')
    })

    it('should not raise an analytics event on api failures', async () => {
      const error = new Error('Internal server error')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'moveToCellSwap' does not exist on type '... Remove this comment to see the full error message
      prisonApi.moveToCellSwap.mockRejectedValue(error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = { cellId: 'C-SWAP' }

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(category:... Remove this comment to see the full error message
      expect(raiseAnalyticsEvent.mock.calls.length).toBe(0)
    })
  })
})
