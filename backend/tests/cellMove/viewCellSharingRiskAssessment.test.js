Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const viewCellSharingRiskAssessmentDetails = require('../../controllers/cellMove/viewCellSharingAssessmentDetails')
const { serviceUnavailableMessage } = require('../../common-messages')

describe('view CSRA details', () => {
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
    assignedLivingUnit: {
      description: 'A-1-12',
    },
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
    elite2Api.getCsraAssessments = jest.fn().mockResolvedValue([
      {
        bookingId: 1234,
        offenderNo,
        classificationCode: 'HIGH',
        classification: 'High',
        assessmentCode: 'CSRF',
        assessmentDescription: 'CSR Full',
        cellSharingAlertFlag: true,
        assessmentDate: '2020-08-27',
        nextReviewDate: '2020-08-29',
        approvalDate: '2020-08-28',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessmentComment: 'Some comment for full assessment',
        assessorId: 1,
        assessorUser: 'TEST_USER',
      },
      {
        bookingId: 1234,
        offenderNo,
        classificationCode: 'STANDARD',
        classification: 'Standard',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2020-08-17',
        nextReviewDate: '2020-08-19',
        approvalDate: '2020-08-18',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessmentComment: 'Some comment',
        assessorId: 1,
        assessorUser: 'TEST_USER',
      },
    ])
    elite2Api.getAgencyDetails = jest.fn().mockResolvedValue({
      description: 'HMP Moorland',
    })

    controller = viewCellSharingRiskAssessmentDetails({ elite2Api, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(elite2Api.getCsraAssessments).toHaveBeenCalledWith(res.locals, [offenderNo])
    expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'MDI')
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

  it('populates the data correctly', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/cellSharingRiskAssessmentDetails.njk',
      expect.objectContaining({
        prisonerName: 'User, Test',
        cellLocation: 'A-1-12',
        location: 'HMP Moorland',
        comment: 'Some comment for full assessment',
        date: '27 August 2020',
        level: 'High',
        backLink: `/prisoner/${offenderNo}/cell-move/select-location`,
        backLinkText: 'Return to select a location',
      })
    )
  })

  it('sets the back link and text correctly when referer data is present', async () => {
    req = { ...req, headers: { referer: `/prisoner/${offenderNo}/cell-move/select-cell` } }
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/cellSharingRiskAssessmentDetails.njk',
      expect.objectContaining({
        backLink: `/prisoner/${offenderNo}/cell-move/select-cell`,
        backLinkText: 'Return to select an available cell',
      })
    )
  })
})
