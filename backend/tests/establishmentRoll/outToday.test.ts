import outToday from '../../controllers/establishmentRoll/outToday'

const movementsService = {
  getMovementsOut: jest.fn(),
}

describe('In today', () => {
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = {
    locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } },
    status: jest.fn(),
    render: jest.fn(),
  }
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
    movementsService.getMovementsOut = jest.fn()
    controller = outToday({ movementsService })
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getMovementsOut).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    movementsService.getMovementsOut.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    movementsService.getMovementsOut.mockReturnValue(offenders)
    await controller(req, res)

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
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--security', label: 'Racist' }],
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
