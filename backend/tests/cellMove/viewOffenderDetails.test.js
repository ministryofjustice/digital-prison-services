Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const viewOffenderDetails = require('../../controllers/cellMove/viewOffenderDetails')
const { serviceUnavailableMessage } = require('../../common-messages')

describe('view offender details', () => {
  let req
  let res
  let logError
  let controller

  const elite2Api = {}

  const offenderNo = 'ABC123'

  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
    age: 21,
    religion: 'Some religion',
    assignedLivingUnit: {
      description: 'A-1-12',
    },
    physicalAttributes: {
      ethnicity: 'White',
      raceCode: 'W1',
    },
    profileInformation: [{ type: 'SEXO', resultValue: 'Heterosexual' }, { type: 'SMOKE', resultValue: 'No' }],
  }

  beforeEach(() => {
    logError = jest.fn()

    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      headers: {},
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn() }

    elite2Api.getDetails = jest.fn().mockResolvedValue(getDetailsResponse)
    elite2Api.getMainOffence = jest.fn().mockResolvedValue([
      {
        offenceDescription: '13 hours over work',
      },
    ])

    controller = viewOffenderDetails({ elite2Api, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(elite2Api.getMainOffence).toHaveBeenCalledWith(res.locals, 1234)
  })

  it('Should render error template when there is an API error', async () => {
    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/prisoner/ABC123/cell-move/select-location',
      homeUrl: '/prisoner/ABC123',
    })
  })

  it('populates the data correctly when all present', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        prisonerName: 'User, Test',
        age: 21,
        religion: 'Some religion',
        offenderNo,
        cellLocation: 'A-1-12',
        ethnicity: 'White (W1)',
        sexualOrientation: 'Heterosexual',
        smokerOrVaper: 'No',
        mainOffence: '13 hours over work',
        backLink: `/prisoner/${offenderNo}/cell-move/select-location`,
        backLinkText: 'Return to select a location',
        profileUrl: `/prisoner/${offenderNo}`,
      })
    )
  })

  it('populates the data correctly when optional missing', async () => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({
      ...getDetailsResponse,
      profileInformation: [],
      age: undefined,
      physicalAttributes: {},
      religion: undefined,
    })
    elite2Api.getMainOffence = jest.fn().mockResolvedValue([])
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        prisonerName: 'User, Test',
        age: 'Not entered',
        religion: 'Not entered',
        offenderNo,
        cellLocation: 'A-1-12',
        ethnicity: 'Not entered',
        sexualOrientation: 'Not entered',
        smokerOrVaper: 'Not entered',
        mainOffence: 'Not entered',
        backLink: `/prisoner/${offenderNo}/cell-move/select-location`,
        backLinkText: 'Return to select a location',
        profileUrl: `/prisoner/${offenderNo}`,
      })
    )
  })

  it('sets the back link and text correctly when referer data is present', async () => {
    req = { ...req, headers: { referer: `/prisoner/${offenderNo}/cell-move/select-cell` } }
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/offenderDetails.njk',
      expect.objectContaining({
        backLink: `/prisoner/${offenderNo}/cell-move/select-cell`,
        backLinkText: 'Return to select an available cell',
      })
    )
  })
})
