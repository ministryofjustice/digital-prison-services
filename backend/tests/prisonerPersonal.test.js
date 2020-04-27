const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')

describe('prisoner personal', () => {
  const offenderNo = 'ABC123'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
  }
  const prisonerProfileService = {}
  let req
  let res
  let controller

  beforeEach(() => {
    req = { params: { offenderNo } }
    res = { locals: {}, render: jest.fn() }
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockReturnValue(prisonerProfileData)
    controller = prisonerPersonal({ prisonerProfileService })
  })

  it('should make a call for the prisoner profile data and render the correct template', async () => {
    await controller(req, res)

    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })
})
