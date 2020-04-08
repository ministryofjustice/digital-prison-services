const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook.js')
const { serviceUnavailableMessage } = require('../common-messages')

describe('prisoner profile quick look', () => {
  const offenderNo = 'ABC123'
  const prisonerHeaderDetails = {
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

    prisonerProfileService.getPrisonerHeader = jest.fn().mockReturnValue(prisonerHeaderDetails)

    elite2Api.getDetails = jest.fn()
    elite2Api.getMainOffence = jest.fn()

    controller = prisonerQuickLook({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details', async () => {
    elite2Api.getDetails.mockReturnValue({ bookingId })

    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerHeader).toHaveBeenCalledWith(res.locals, offenderNo)
  })

  describe('offence data', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockReturnValue({ bookingId })
    })

    it('should make a call for offence data', async () => {
      await controller(req, res)

      expect(elite2Api.getMainOffence).toHaveBeenCalledWith(res.locals, bookingId)
    })

    it('should render the quick look template with the offence data', async () => {
      elite2Api.getMainOffence.mockReturnValue([
        { offenceDescription: 'Have blade/article  which was sharply pointed in public place' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerQuickLook.njk', {
        headerDetails: prisonerHeaderDetails,
        offenceDetails: [
          {
            key: { text: 'Main offence(s)' },
            value: { text: 'Have blade/article  which was sharply pointed in public place' },
          },
        ],
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
