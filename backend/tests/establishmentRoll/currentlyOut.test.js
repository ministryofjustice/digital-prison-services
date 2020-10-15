const currentlyOut = require('../../controllers/establishmentRoll/currentlyOut')

const movementsService = {}

describe('Currently out', () => {
  const logError = jest.fn()
  let controller
  const livingUnitId = 1234
  const req = { originalUrl: 'http://localhost', params: { livingUnitId } }
  const res = { locals: {} }
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
    movementsService.getOffendersCurrentlyOutOfLivingUnit = jest.fn()
    controller = currentlyOut({ movementsService, logError })
    res.render = jest.fn()
  })

  it('should call the en route endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getOffendersCurrentlyOutOfLivingUnit).toHaveBeenCalledWith(res.locals, livingUnitId)
  })

  it('should return response with data', async () => {
    movementsService.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue({ location: 'A', currentlyOut: offenders })
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/currentlyOut.njk',
      expect.objectContaining({
        livingUnitName: 'A',
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
