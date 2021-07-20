const inToday = require('../../controllers/establishmentRoll/inToday')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'movementsS... Remove this comment to see the full error message
const movementsService = {}

describe('In today', () => {
  let logError
  let controller
  const agencyId = 'MDI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI', description: 'Leeds' } } }, status: jest.fn() }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      iepLevel: 'Basic',
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP)',
      location: 'MDI-1-1',
      alerts: [],
      movementTime: '11:11:11',
      category: 'C',
    },
    {
      offenderNo: 'G0000AA',
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      iepLevel: 'Enhanced',
      fromAgency: 'LEI',
      fromAgencyDescription: 'Leeds (HMP)',
      fromCity: 'Leeds',
      location: 'MDI-1-2',
      alerts: ['XR'],
      movementTime: '12:12:12',
      category: 'A',
    },
  ]
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
    movementsService.getMovementsIn = jest.fn()
    logError = jest.fn()
    controller = inToday({ movementsService, logError })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
    expect(movementsService.getMovementsIn).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
    movementsService.getMovementsIn.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
    movementsService.getMovementsIn.mockReturnValue(offenders)
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/inToday.njk',
      expect.objectContaining({
        results: [
          {
            alerts: [],
            dob: '01/01/1980',
            incentiveLevel: 'Basic',
            location: '1-1',
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            arrivedFrom: 'Moorland (HMP)',
            timeIn: '11:11',
            category: 'C',
          },
          {
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            dob: '31/12/1980',
            incentiveLevel: 'Enhanced',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            location: '1-2',
            arrivedFrom: 'Leeds (HMP)',
            timeIn: '12:12',
            category: 'A',
          },
        ],
      })
    )
  })
})
