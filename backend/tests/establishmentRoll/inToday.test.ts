import inToday from '../../controllers/establishmentRoll/inToday'

const movementsService = {
  getMovementsIn: jest.fn(),
}

describe('In today', () => {
  let controller
  const agencyId = 'MDI'
  const req = { originalUrl: 'http://localhost' }
  const res = {
    locals: { user: { activeCaseLoad: { caseLoadId: 'MDI', description: 'Leeds' } } },
    status: jest.fn(),
    render: jest.fn(),
  }
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
    movementsService.getMovementsIn = jest.fn()
    controller = inToday({ movementsService })
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getMovementsIn).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    movementsService.getMovementsIn.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    movementsService.getMovementsIn.mockReturnValue(offenders)
    await controller(req, res)

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
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--security', label: 'Racist' }],
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
