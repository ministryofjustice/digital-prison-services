import viewCellSharingRiskAssessmentDetails from '../../controllers/cellMove/viewCellSharingAssessmentDetails'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

describe('view CSRA details', () => {
  let req
  let res
  let logError
  let controller

  const prisonApi = {}

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
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue(getDetailsResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCsraAssessments' does not exist on ty... Remove this comment to see the full error message
    prisonApi.getCsraAssessments = jest.fn().mockResolvedValue([
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({
      description: 'HMP Moorland',
    })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = viewCellSharingRiskAssessmentDetails({ prisonApi, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCsraAssessments' does not exist on ty... Remove this comment to see the full error message
    expect(prisonApi.getCsraAssessments).toHaveBeenCalledWith(res.locals, [offenderNo])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'MDI')
  })

  it('Should render error template when there is an API error', async () => {
    const error = new Error('Network error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.redirectUrl).toBe('/prisoner/ABC123/cell-move/search-for-cell')
    expect(res.locals.homeUrl).toBe('/prisoner/ABC123')
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
        backLink: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        backLinkText: 'Return to search for a cell',
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