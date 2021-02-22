const prisonerCsraHistory = require('../controllers/prisonerProfile/prisonerCsraHistory')

describe('Prisoner CSRA History', () => {
  const offenderNo = 'ABC123'
  const prisonApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
    }
    res = { locals: {}, render: jest.fn() }

    prisonApi.getDetails = jest.fn().mockResolvedValue({})
    prisonApi.getCsraAssessmentsForPrisoner = jest.fn().mockResolvedValue([])
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})

    controller = prisonerCsraHistory({ prisonApi })
  })

  it('should make the expected calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, offenderNo)
    expect(prisonApi.getCsraAssessmentsForPrisoner).toHaveBeenCalledWith(
      {},
      { offenderNo, latestOnly: 'false', activeOnly: 'false' }
    )
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  describe('with csra data', () => {
    beforeEach(() => {
      prisonApi.getDetails.mockResolvedValue({ firstName: 'John', lastName: 'Smith' })
      prisonApi.getCsraAssessmentsForPrisoner.mockResolvedValue([
        {
          bookingId: 1,
          offenderNo,
          classificationCode: 'STANDARD',
          classification: 'Standard',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR Rating',
          cellSharingAlertFlag: true,
          assessmentDate: '2011-06-02',
          nextReviewDate: '2011-06-03',
          assessmentAgencyId: 'MDI',
          assessmentStatus: 'A',
          assessmentSeq: 1,
          assessorId: 17551,
          assessorUser: 'TQL59P',
        },
        {
          bookingId: 2,
          offenderNo,
          classificationCode: 'HI',
          classification: 'High',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR Rating',
          cellSharingAlertFlag: true,
          assessmentDate: '2014-11-10',
          nextReviewDate: '2015-11-11',
          approvalDate: '2014-11-18',
          assessmentAgencyId: 'DNI',
          assessmentStatus: 'A',
          assessmentSeq: 3,
          assessmentComment: 'comment',
          assessorId: 397307,
          assessorUser: 'DQL61T',
        },
        {
          bookingId: 2,
          offenderNo,
          classificationCode: 'PEND',
          classification: 'Pending',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR Rating',
          cellSharingAlertFlag: true,
          assessmentDate: '2013-11-10',
          nextReviewDate: '2014-11-11',
          approvalDate: '2013-11-18',
          assessmentAgencyId: 'DNI',
          assessmentStatus: 'A',
          assessmentSeq: 2,
          assessmentComment: 'comment',
          assessorId: 397307,
          assessorUser: 'DQL61T',
        },
      ])
      prisonApi.getAgencyDetails
        .mockResolvedValueOnce({
          agencyId: 'MDI',
          description: 'Moorland',
          agencyType: 'INST',
          active: true,
        })
        .mockResolvedValueOnce({
          agencyId: 'DNI',
          description: 'Doncaster',
          agencyType: 'INST',
          active: true,
        })
    })

    it('should render the correct template with the correct values', async () => {
      await controller(req, res)

      expect(prisonApi.getAgencyDetails).toHaveBeenCalledTimes(2)
      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCsraHistory.njk', {
        breadcrumbPrisonerName: 'Smith, John',
        csraOptions: [
          {
            text: 'Standard',
            value: 'STANDARD',
          },
          {
            text: 'High',
            value: 'HI',
          },
          {
            text: 'Pending',
            value: 'PEND',
          },
        ],
        formValues: {},
        locationOptions: [
          {
            text: 'Moorland',
            value: 'MDI',
          },
          {
            text: 'Doncaster',
            value: 'DNI',
          },
        ],
        prisonerName: 'John Smith',
        profileUrl: '/prisoner/ABC123',
        rows: [
          [{ text: '10/11/2014' }, { text: 'High' }, { text: 'Doncaster' }, { text: 'comment' }],
          [{ text: '10/11/2013' }, { text: 'Pending' }, { text: 'Doncaster' }, { text: 'comment' }],
          [{ text: '02/06/2011' }, { text: 'Standard' }, { text: 'Moorland' }, { text: 'Not entered' }],
        ],
      })
    })

    describe('with query params', () => {
      it('should return only the relevant csra level results', async () => {
        req.query = { csra: 'HI' }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerCsraHistory.njk',
          expect.objectContaining({
            rows: [[{ text: '10/11/2014' }, { text: 'High' }, { text: 'Doncaster' }, { text: 'comment' }]],
          })
        )
      })

      it('should return only the relevant location results', async () => {
        req.query = { location: 'MDI' }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerCsraHistory.njk',
          expect.objectContaining({
            rows: [[{ text: '02/06/2011' }, { text: 'Standard' }, { text: 'Moorland' }, { text: 'Not entered' }]],
          })
        )
      })

      it('should return only the relevant location and csra level results', async () => {
        req.query = { location: 'DNI', csra: 'HI' }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerCsraHistory.njk',
          expect.objectContaining({
            rows: [[{ text: '10/11/2014' }, { text: 'High' }, { text: 'Doncaster' }, { text: 'comment' }]],
          })
        )
      })
    })
  })

  describe('errors', () => {
    it('should throw an error with the correct redirect url', async () => {
      const error = new Error('Network error')
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)

      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })
  })
})
