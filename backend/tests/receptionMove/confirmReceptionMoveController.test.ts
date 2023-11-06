import confirmReceptionMove from '../../controllers/receptionMove/confirmReceptionMove'
import logger from '../../log'

describe('Confirm reception move', () => {
  logger.info = jest.fn()
  logger.error = jest.fn()
  const prisonApi = {
    getDetails: jest.fn(),
    getReceptionsWithCapacity: jest.fn(),
    getCellMoveReasonTypes: jest.fn(),
  }
  const whereaboutsApi = {
    moveToCell: jest.fn(),
  }

  let controller
  const req = {
    originalUrl: 'http://localhost',
    params: { offenderNo: 'A12345' },
    query: {},
    headers: { referer: '' },
    flash: jest.fn(),
    body: {},
  }
  const res = {
    locals: {
      redirectUrl: '',
      homeUrl: '',
    },
    status: jest.fn(),
    render: jest.fn(),
    redirect: jest.fn(),
    flash: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    prisonApi.getDetails = jest.fn().mockResolvedValue({
      bookingId: 1,
      firstName: 'Bob',
      lastName: 'Doe',
      agencyId: 'MDI',
    })

    prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue([
      {
        activeFlag: 'N',
        code: 'ADM',
        domain: 'CHG_HOUS_RSN',
        description: 'Administrative',
      },
      {
        activeFlag: 'N',
        code: 'BEH',
        description: 'Behaviour',
      },
    ])

    req.params = {
      offenderNo: 'A12345',
    }

    controller = confirmReceptionMove({ prisonApi, whereaboutsApi })
  })

  describe('view', () => {
    it('Should get prisoner details', async () => {
      await controller.view(req, res)
      expect(prisonApi.getDetails).toHaveBeenCalledWith({ homeUrl: '', redirectUrl: '' }, 'A12345', false)
    })

    it('Should set backUrl to the previous page', async () => {
      req.headers.referer = '/prisoner/A12345/reception-move/consider-risks-reception'
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/confirmReceptionMove.njk',
        expect.objectContaining({ backUrl: '/prisoner/A12345/reception-move/consider-risks-reception' })
      )
    })
    it('Should set backUrl to null', async () => {
      req.headers.referer = null
      await controller.view(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/confirmReceptionMove.njk',
        expect.objectContaining({ backUrl: null })
      )
    })

    it('Should include correct radio options in render data', async () => {
      const receptionMoveTypes = [
        {
          code: 'ADM',
          description: 'Administrative',
          activeFlag: 'N',
        },
        {
          code: 'GM',
          description: 'General moves',
          activeFlag: 'Y',
        },
      ]
      prisonApi.getCellMoveReasonTypes.mockResolvedValue(receptionMoveTypes)
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/confirmReceptionMove.njk',
        expect.objectContaining({
          receptionMoveReasonRadioValues: [
            {
              checked: false,
              text: 'General moves',
              value: 'GM',
            },
          ],
        })
      )
    })

    it('Should include user input errors in render data', async () => {
      const formValues = [
        {
          comment: undefined,
        },
      ]

      const errors = [
        {
          href: '#reason',
          text: 'Select a reason for the move',
        },
        {
          href: '#comment',
          text: 'Explain why the person is being moved to reception',
        },
      ]

      req.flash.mockReturnValueOnce(formValues)
      req.flash.mockReturnValueOnce(errors)

      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/confirmReceptionMove.njk',
        expect.objectContaining({
          errors: [
            { href: '#reason', text: 'Select a reason for the move' },
            { href: '#comment', text: 'Explain why the person is being moved to reception' },
          ],
          formValues: { comment: undefined },
        })
      )
    })
    it('should render complete set of render data', async () => {
      req.headers.referer = '/prisoner/A12345/reception-move/consider-risks-reception'
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith('receptionMoves/confirmReceptionMove.njk', {
        backUrl: '/prisoner/A12345/reception-move/consider-risks-reception',
        cancelLinkHref: '/prisoner/A12345/location-details',
        errors: undefined,
        formValues: { comment: undefined },
        offenderName: 'Bob Doe',
        offenderNo: 'A12345',
        receptionMoveReasonRadioValues: [],
      })
    })
  })

  describe('post', () => {
    it('should call flash with input values', async () => {
      req.body = {
        reason: 'GM',
        comment: 'my comments',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([])
      await controller.post(req, res)
      expect(req.flash).toHaveBeenCalledWith('formValues', { comment: 'my comments', reason: 'GM' })
    })

    it('should call upstream services correctly', async () => {
      req.body = {
        reason: 'GM',
        comment: 'my comments',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([{}])

      await controller.post(req, res)
      expect(prisonApi.getDetails).toBeCalledWith({ homeUrl: '', redirectUrl: '' }, 'A12345', true)
      expect(whereaboutsApi.moveToCell).toBeCalledWith(
        { homeUrl: '', redirectUrl: '' },
        {
          bookingId: 1,
          cellMoveReasonCode: 'GM',
          commentText: 'my comments',
          internalLocationDescriptionDestination: undefined,
          offenderNo: 'A12345',
        }
      )
    })

    it('should call flash if no user inputs', async () => {
      req.body = {}
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([])
      await controller.post(req, res)

      expect(req.flash).toHaveBeenNthCalledWith(1, 'formValues', {})
      expect(req.flash).toHaveBeenNthCalledWith(2, 'errors', [
        { href: '#reason', text: 'Select a reason for the move' },
        { href: '#comment', text: 'Explain why the person is being moved to reception' },
      ])

      expect(res.redirect).toBeCalledWith(`/prisoner/A12345/reception-move/confirm-reception-move`)
    })
    it('should call flash if comments below the minimum size limit', async () => {
      req.body = {
        reason: 'GM',
        comment: 'abc',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([{}])

      await controller.post(req, res)
      expect(req.flash).toHaveBeenNthCalledWith(1, 'formValues', { comment: 'abc', reason: 'GM' })
      expect(req.flash).toHaveBeenNthCalledWith(2, 'errors', [
        { href: '#comment', text: 'Provide more detail about why this person is being moved to reception' },
      ])
    })
    it('should redirect to prison-full', async () => {
      req.body = {
        reason: 'GM',
        comment: 'my comments',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([])
      await controller.post(req, res)

      expect(logger.info).toBeCalled()
      expect(res.redirect).toBeCalledWith(`/prisoner/A12345/reception-move/reception-full`)
    })

    it('should redirect to /confirmation', async () => {
      req.body = {
        reason: 'GM',
        comment: 'my comments',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([{}])

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledTimes(1)
      expect(res.redirect).toBeCalledWith('/prisoner/A12345/reception-move/confirmation')
    })

    it('should redirect to /consider-risks-reception', async () => {
      const error = new Error('network error')
      req.body = {
        reason: 'GM',
        comment: 'my comments',
      }

      prisonApi.getReceptionsWithCapacity.mockResolvedValue([{}])
      whereaboutsApi.moveToCell.mockRejectedValue(error)

      await expect(controller.post(req, res)).rejects.toThrowError(error)

      expect(logger.error).toBeCalled()
      expect(res.locals.redirectUrl).toBe('/prisoner/A12345/reception-move/consider-risks-reception')
    })

    it('should call flash if comments below a minimum size', async () => {
      req.body = {
        reason: 'GM',
        comment: 'abc',
      }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([{}])

      await controller.post(req, res)
      expect(req.flash).toHaveBeenNthCalledWith(1, 'formValues', { comment: 'abc', reason: 'GM' })
      expect(req.flash).toHaveBeenNthCalledWith(2, 'errors', [
        { href: '#comment', text: 'Provide more detail about why this person is being moved to reception' },
      ])
    })
  })
})
