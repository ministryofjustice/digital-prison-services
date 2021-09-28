import totalCurrentlyOut from '../../controllers/establishmentRoll/totalCurrentlyOut'

const movementsService = {}

describe('Currently out', () => {
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
      iepLevel: 'Basic',
      fromAgency: 'LEI',
      location: 'LEI-1-1',
      toCity: 'Somewhere',
      alerts: [],
      commentText: 'Comments',
    },
    {
      offenderNo: 'G0000AA',
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      iepLevel: 'Enhanced',
      fromAgency: 'LEI',
      location: 'LEI-1-2',
      toCity: 'Somewhere Else',
      alerts: ['XR'],
      commentText: 'Comments',
    },
  ]
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
    movementsService.getOffendersCurrentlyOutOfAgency = jest.fn()
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ movementsService: {}; logError... Remove this comment to see the full error message
    controller = totalCurrentlyOut({ movementsService, logError })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
  })

  it('should call the currently out for agency endpoint', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
    expect(movementsService.getOffendersCurrentlyOutOfAgency).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
    movementsService.getOffendersCurrentlyOutOfAgency.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
    movementsService.getOffendersCurrentlyOutOfAgency.mockReturnValue(offenders)
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/totalCurrentlyOut.njk',
      expect.objectContaining({
        results: [
          {
            alerts: [],
            comment: 'Comments',
            currentLocation: 'Somewhere',
            dob: '01/01/1980',
            incentiveLevel: 'Basic',
            location: '1-1',
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
          },
          {
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            comment: 'Comments',
            currentLocation: 'Somewhere Else',
            dob: '31/12/1980',
            incentiveLevel: 'Enhanced',
            location: '1-2',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
          },
        ],
      })
    )
  })
})
