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
  const bookingId = '123'
  const elite2Api = {}
  const prisonerProfileService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo } }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockResolvedValue({})
    elite2Api.getIdentifiers = jest.fn().mockResolvedValue([])
    elite2Api.getOffenderAliases = jest.fn().mockResolvedValue([])
    controller = prisonerPersonal({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  describe('identifiers', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for identifiers data', async () => {
      await controller(req, res)

      expect(elite2Api.getIdentifiers).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing identifier data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: undefined },
              { label: 'CRO number', value: undefined },
              { label: 'National insurance number', value: undefined },
              { label: 'Home office reference number', value: undefined },
              { label: 'Driving licence number', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is identifier data', () => {
      beforeEach(() => {
        elite2Api.getIdentifiers = jest
          .fn()
          .mockResolvedValue([
            { type: 'PNC', value: '1234' },
            { type: 'CRO', value: '2345' },
            { type: 'NINO', value: '3456' },
            { type: 'HOREF', value: '4567' },
            { type: 'DL', value: '5678' },
          ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: '1234' },
              { label: 'CRO number', value: '2345' },
              { label: 'National insurance number', value: '3456' },
              { label: 'Home office reference number', value: '4567' },
              { label: 'Driving licence number', value: '5678' },
            ],
          })
        )
      })
    })
  })

  describe('aliases', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for identifiers data', async () => {
      await controller(req, res)

      expect(elite2Api.getOffenderAliases).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing aliases data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [],
          })
        )
      })
    })

    describe('when there is aliases data', () => {
      beforeEach(() => {
        elite2Api.getOffenderAliases = jest
          .fn()
          .mockResolvedValue([
            { firstName: 'First', lastName: 'Alias', dob: '1985-08-31' },
            { firstName: 'Second', lastName: 'Alias', dob: '1986-05-20' },
          ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [{ label: 'Alias, First', value: '31/08/1985' }, { label: 'Alias, Second', value: '20/05/1986' }],
          })
        )
      })
    })
  })

  describe('when there are errors with retrieving information', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      elite2Api.getIdentifiers.mockRejectedValue(new Error('Network error'))
      elite2Api.getOffenderAliases.mockRejectedValue(new Error('Network error'))
    })

    it('should still render the personal template with missing data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal.njk',
        expect.objectContaining({
          identifiers: [
            { label: 'PNC number', value: null },
            { label: 'CRO number', value: null },
            { label: 'National insurance number', value: null },
            { label: 'Home office reference number', value: null },
            { label: 'Driving licence number', value: null },
          ],
          aliases: null,
        })
      )
    })
  })
})
