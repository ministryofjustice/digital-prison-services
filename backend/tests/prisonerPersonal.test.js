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
    elite2Api.getPhysicalAttributes = jest.fn().mockResolvedValue({})
    elite2Api.getPhysicalCharacteristics = jest.fn().mockResolvedValue([])
    elite2Api.getPhysicalMarks = jest.fn().mockResolvedValue([])
    elite2Api.getPrisonerProperty = jest.fn().mockResolvedValue([])
    controller = prisonerPersonal({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the full details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
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
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: undefined, alwaysShow: true },
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
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: '1234', alwaysShow: true },
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
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
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
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [{ label: 'Alias, First', value: '31/08/1985' }, { label: 'Alias, Second', value: '20/05/1986' }],
          })
        )
      })
    })
  })

  describe('physical characteristics', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing physical characteristic data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: undefined },
              { label: 'Weight', value: undefined },
              { label: 'Hair colour', value: undefined },
              { label: 'Left eye colour', value: undefined },
              { label: 'Right eye colour', value: undefined },
              { label: 'Facial hair', value: undefined },
              { label: 'Shape of face', value: undefined },
              { label: 'Build', value: undefined },
              { label: 'Shoe size', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is physical characteristic data', () => {
      beforeEach(() => {
        elite2Api.getPhysicalAttributes.mockResolvedValue({
          heightMetres: 1.91,
          weightKilograms: 86,
        })
        elite2Api.getPhysicalCharacteristics.mockResolvedValue([
          { type: 'HAIR', detail: 'Brown' },
          { type: 'R_EYE_C', detail: 'Green' },
          { type: 'L_EYE_C', detail: 'Blue' },
          { type: 'FACIAL_HAIR', detail: 'Moustache' },
          { type: 'FACE', detail: 'Round' },
          { type: 'BUILD', detail: 'Athletic' },
          { type: 'SHOESIZE', detail: '12' },
        ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: '1.91m' },
              { label: 'Weight', value: '86kg' },
              { label: 'Hair colour', value: 'Brown' },
              { label: 'Left eye colour', value: 'Blue' },
              { label: 'Right eye colour', value: 'Green' },
              { label: 'Facial hair', value: 'Moustache' },
              { label: 'Shape of face', value: 'Round' },
              { label: 'Build', value: 'Athletic' },
              { label: 'Shoe size', value: '12' },
            ],
          })
        )
      })
    })
  })

  describe('distinguishing physical marks', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing distinguishing physical marks data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: [],
          })
        )
      })
    })

    describe('when there is distinguishing physical marks data', () => {
      beforeEach(() => {
        elite2Api.getPhysicalMarks.mockResolvedValue([
          { type: 'Tattoo', side: 'Left', bodyPart: 'Arm', comment: 'Childs name', orentiation: 'Facing up' },
          { type: 'Tattoo', side: 'Right', bodyPart: 'Arm', comment: 'Face', orentiation: 'Facing down', imageId: 123 },
        ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: [
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Left' },
                  { label: 'Orientation', value: 'Facing up' },
                  { label: 'Comment', value: 'Childs name' },
                ],
                label: 'Tattoo',
              },
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Right' },
                  { label: 'Orientation', value: 'Facing down' },
                  { label: 'Comment', value: 'Face' },
                ],
                label: 'Tattoo',
                imageId: 123,
              },
            ],
          })
        )
      })
    })
  })

  describe('property', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing property data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            property: [],
          })
        )
      })
    })

    describe('when there is property data', () => {
      beforeEach(() => {
        elite2Api.getPrisonerProperty.mockResolvedValue([
          {
            containerType: 'Valuables',
            location: { userDescription: 'Property Box 123' },
            sealMark: 123,
          },
          {
            containerType: 'Bulk',
            location: { userDescription: 'Property Box 456' },
            sealMark: 456,
          },
        ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            property: [
              {
                details: [{ label: 'Seal mark', value: 123 }, { label: 'Location', value: 'Property Box 123' }],
                label: 'Property',
                value: 'Valuables',
              },
              {
                details: [{ label: 'Seal mark', value: 456 }, { label: 'Location', value: 'Property Box 456' }],
                label: 'Property',
                value: 'Bulk',
              },
            ],
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
      elite2Api.getPhysicalAttributes.mockRejectedValue(new Error('Network error'))
      elite2Api.getPhysicalCharacteristics.mockRejectedValue(new Error('Network error'))
      elite2Api.getPhysicalMarks.mockRejectedValue(new Error('Network error'))
      elite2Api.getPrisonerProperty.mockRejectedValue(new Error('Network error'))
    })

    it('should still render the personal template with missing data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({
          identifiers: [
            { label: 'PNC number', value: null, alwaysShow: true },
            { label: 'CRO number', value: null },
            { label: 'National insurance number', value: null },
            { label: 'Home office reference number', value: null },
            { label: 'Driving licence number', value: null },
          ],
          aliases: null,
          physicalCharacteristics: [
            { label: 'Height', value: null },
            { label: 'Weight', value: null },
            { label: 'Hair colour', value: null },
            { label: 'Left eye colour', value: null },
            { label: 'Right eye colour', value: null },
            { label: 'Facial hair', value: null },
            { label: 'Shape of face', value: null },
            { label: 'Build', value: null },
            { label: 'Shoe size', value: null },
          ],
          distinguishingMarks: null,
          property: null,
        })
      )
    })
  })
})
