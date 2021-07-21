import enRoute from '../../controllers/establishmentRoll/enRoute'

const movementsService = {}

describe('En route test', () => {
  let logError
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } }, status: jest.fn() }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      bookingId: -1,
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      fromAgencyDescription: 'Hull (HMP)',
      movementDate: '2010-10-10',
      movementTime: '01:01:45',
      movementReasonDescription: 'Normal transfer',
      location: 'LEI-A-01-011',
      alerts: ['XR'],
      category: 'A',
    },
    {
      offenderNo: 'G0000AA',
      bookingId: -2,
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      fromAgencyDescription: 'Outside',
      movementTime: '23:59:59',
      movementReasonDescription: 'Normal transfer',
      location: 'LEI-A-02-011',
      alerts: [],
      category: 'C',
    },
  ]
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
    movementsService.getOffendersEnRoute = jest.fn()
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ movementsService: {}; logError... Remove this comment to see the full error message
    controller = enRoute({ movementsService, logError })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
  })

  it('should call the en route endpoint', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
    expect(movementsService.getOffendersEnRoute).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
    movementsService.getOffendersEnRoute.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
    movementsService.getOffendersEnRoute.mockReturnValue(offenders)
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/enRoute.njk',
      expect.objectContaining({
        agencyName: 'Leeds',
        results: [
          {
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            dob: '01/01/1980',
            departed: '<div>01:01</div>10/10/2010',
            from: 'Hull (HMP)',
            reason: 'Normal transfer',
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            category: 'A',
          },
          {
            alerts: [],
            departed: '<div>23:59</div>Invalid date',
            dob: '31/12/1980',
            from: 'Outside',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            reason: 'Normal transfer',
            category: 'C',
          },
        ],
      })
    )
  })
})
