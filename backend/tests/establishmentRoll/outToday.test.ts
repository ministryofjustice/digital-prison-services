const outToday = require('../../controllers/establishmentRoll/outToday')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'movementsS... Remove this comment to see the full error message
const movementsService = {}

describe('In today', () => {
  let logError
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } }, status: jest.fn() }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      reasonDescription: 'Normal transfer',
      alerts: [],
      timeOut: '11:11:11',
      category: 'C',
    },
    {
      offenderNo: 'G0000AA',
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      reasonDescription: 'Normal transfer',
      alerts: ['XR'],
      timeOut: '12:12:12',
      category: 'A',
    },
  ]
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
    movementsService.getMovementsOut = jest.fn()
    logError = jest.fn()
    controller = outToday({ movementsService, logError })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
    expect(movementsService.getMovementsOut).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
    movementsService.getMovementsOut.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
    movementsService.getMovementsOut.mockReturnValue(offenders)
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/outToday.njk',
      expect.objectContaining({
        results: [
          {
            alerts: [],
            dob: '01/01/1980',
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            reason: 'Normal transfer',
            timeOut: '11:11',
            category: 'C',
          },
          {
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            dob: '31/12/1980',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            reason: 'Normal transfer',
            timeOut: '12:12',
            category: 'A',
          },
        ],
      })
    )
  })
})
