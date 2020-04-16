const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook.js')
const { serviceUnavailableMessage } = require('../common-messages')

describe('prisoner profile quick look', () => {
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
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockReturnValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockReturnValue({})
    elite2Api.getMainOffence = jest.fn().mockReturnValue([])
    elite2Api.getPrisonerBalances = jest.fn().mockReturnValue({})
    elite2Api.getPrisonerDetails = jest.fn().mockReturnValue([])
    elite2Api.getPrisonerSentenceDetails = jest.fn().mockReturnValue({})

    controller = prisonerQuickLook({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    elite2Api.getDetails.mockReturnValue({ bookingId })

    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerQuickLook.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  describe('offence data', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockReturnValue({ bookingId })
    })

    it('should make a call for offence data', async () => {
      await controller(req, res)

      expect(elite2Api.getMainOffence).toHaveBeenCalledWith(res.locals, bookingId)
    })

    it('should still render the quick look template when there is offence data missing', async () => {
      elite2Api.getMainOffence.mockReturnValue([
        { offenceDescription: 'Have blade/article  which was sharply pointed in public place' },
      ])
      elite2Api.getPrisonerDetails = jest.fn().mockReturnValue([])
      elite2Api.getPrisonerSentenceDetails = jest.fn().mockReturnValue({})

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            {
              label: 'Main offence(s)',
              value: 'Have blade/article  which was sharply pointed in public place',
            },
            {
              label: 'Imprisonment status',
              value: false,
            },
            {
              label: 'Release date',
              value: undefined,
            },
          ],
        })
      )
    })

    describe('when there is missing offence data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence(s)',
                value: false,
              },
              {
                label: 'Imprisonment status',
                value: false,
              },
              {
                label: 'Release date',
                value: undefined,
              },
            ],
          })
        )
      })
    })

    describe('when there is offence data', () => {
      beforeEach(() => {
        elite2Api.getMainOffence.mockReturnValue([
          { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
        ])
        elite2Api.getPrisonerDetails = jest
          .fn()
          .mockReturnValue([{ imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03' }])
        elite2Api.getPrisonerSentenceDetails = jest
          .fn()
          .mockReturnValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
      })

      it('should render the quick look template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence(s)',
                value: 'Have blade/article which was sharply pointed in public place',
              },
              {
                label: 'Imprisonment status',
                value: 'Adult Imprisonment Without Option CJA03',
              },
              {
                label: 'Release date',
                value: '13/12/2020',
              },
            ],
          })
        )
      })
    })
  })

  describe('balance data', () => {
    describe('when there is missing balance data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              { label: 'Spends', value: '' },
              { label: 'Private', value: '' },
              { label: 'Savings', value: '' },
            ],
          })
        )
      })
    })

    describe('when there is balance data', () => {
      beforeEach(() => {
        elite2Api.getPrisonerBalances.mockReturnValue({ spends: 100, cash: 75.5, savings: 50, currency: 'GBP' })
      })

      it('should render the quick look template with the correctly formatted balance/money data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              { label: 'Spends', value: '£100.00' },
              { label: 'Private', value: '£75.50' },
              { label: 'Savings', value: '£50.00' },
            ],
          })
        )
      })
    })
  })

  describe('personal data', () => {
    describe('when there is missing personal data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: undefined },
              { label: 'Nationality', value: undefined },
              { label: 'PNC number', value: undefined },
              { label: 'CRO number', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is personal data', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1578873601000)
        elite2Api.getPrisonerDetails = jest
          .fn()
          .mockReturnValue([
            { dateOfBirth: '1998-12-01', nationalities: 'Brtish', pncNumber: '12/3456A', croNumber: '12345/57B' },
          ])
      })

      it('should render the quick look template with the correctly formatted personal details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: 21 },
              { label: 'Nationality', value: 'Brtish' },
              { label: 'PNC number', value: '12/3456A' },
              { label: 'CRO number', value: '12345/57B' },
            ],
          })
        )
      })
    })
  })

  describe('when there are errors with elite2Api', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))
    })

    it('should render the error template', async () => {
      await controller(req, res)

      expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: 'http://localhost:3000/' })
    })
  })
})
