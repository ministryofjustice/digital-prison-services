import totalCurrentlyOut from '../../controllers/establishmentRoll/totalCurrentlyOut'

const movementsService = {
  getOffendersCurrentlyOutOfAgency: jest.fn(),
}
const systemOauthClient = {
  getClientCredentialsTokens: jest.fn(),
}

describe('Currently out', () => {
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
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})
    movementsService.getOffendersCurrentlyOutOfAgency = jest.fn()
    controller = totalCurrentlyOut({ systemOauthClient, movementsService })
    res.render = jest.fn()
  })

  it('should call the currently out for agency endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getOffendersCurrentlyOutOfAgency).toHaveBeenCalledWith({}, agencyId)
  })

  it('should return right error message', async () => {
    const error = new Error('error')
    movementsService.getOffendersCurrentlyOutOfAgency.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })

  it('should return response with data', async () => {
    movementsService.getOffendersCurrentlyOutOfAgency.mockReturnValue(offenders)
    await controller(req, res)

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
