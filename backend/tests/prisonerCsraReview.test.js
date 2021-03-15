const prisonerCsraReview = require('../controllers/prisonerProfile/prisonerCsraReview')

describe('Prisoner CSRA Review', () => {
  const offenderNo = 'ABC123'
  const bookingId = 123
  const prisonApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { assessmentSeq: 1, bookingId },
    }
    res = { locals: {}, render: jest.fn() }

    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Smith' })
    prisonApi.getCsraReviewForBooking = jest.fn().mockResolvedValue({})
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})
    prisonApi.getStaffDetails = jest.fn().mockResolvedValue({})

    controller = prisonerCsraReview({ prisonApi })
  })

  it('should make the expected calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, offenderNo)
    expect(prisonApi.getCsraReviewForBooking).toHaveBeenCalledWith({}, bookingId, 1)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
    expect(prisonApi.getStaffDetails).not.toHaveBeenCalled()
  })

  describe('with csra review data', () => {
    describe('with a non overide review that has missing data', () => {
      beforeEach(() => {
        prisonApi.getCsraReviewForBooking.mockResolvedValue({
          bookingId,
          assessmentSeq: 1,
          offenderNo,
          classificationCode: 'HI',
          assessmentCode: 'CSRREV',
          cellSharingAlertFlag: true,
          assessmentDate: '2011-03-15',
          assessorUser: 'USER1',
          nextReviewDate: '2011-06-13',
          questions: [
            {
              question: 'Does the prisoner have a history of self-harm?',
              answer: 'Yes',
            },
          ],
        })
        prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Leeds' })
        prisonApi.getStaffDetails.mockResolvedValue({ firstName: 'Staff', lastName: 'One' })
      })

      it('should make the additional expected calls', async () => {
        await controller(req, res)

        expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
        expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'USER1')
      })

      it('should render the correct template with the correct values', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCsraReview.njk', {
          breadcrumbPrisonerName: 'Smith, John',
          details: [
            {
              key: { text: 'CSRA' },
              value: { text: 'High' },
            },
            {
              key: { classes: 'govuk-!-padding-top-6', text: 'Location' },
              value: { text: 'Not entered' },
            },
            {
              key: { text: 'Comments' },
              value: { text: 'Not entered' },
            },
            {
              key: { text: 'Reviewed by' },
              value: { text: 'Not entered - Staff One' },
            },
            {
              key: { text: 'Next review date' },
              value: { text: '13 June 2011' },
            },
          ],
          profileUrl: `/prisoner/${offenderNo}`,
          reviewDate: '15 March 2011',
          reviewQuestions: [
            {
              question: 'Does the prisoner have a history of self-harm?',
              answer: 'Yes',
            },
          ],
        })
      })
    })

    describe('with an override review', () => {
      const overrideReview = {
        bookingId,
        assessmentSeq: 2,
        offenderNo,
        classificationCode: 'STANDARD',
        assessmentCode: 'CSRREV',
        cellSharingAlertFlag: true,
        assessmentDate: '2011-03-15',
        assessmentAgencyId: 'MDI',
        assessmentComment: 'Comments about the review',
        assessmentCommitteeCode: 'REVIEW',
        assessmentCommitteeName: 'Review Board',
        assessorUser: 'USER2',
        approvalDate: '2011-11-06',
        approvalCommitteeCode: 'REVIEW',
        approvalCommitteeName: 'Review Board',
        originalClassificationCode: 'LOW',
        classificationReviewReason: 'Previous History',
        nextReviewDate: '2011-06-13',
        questions: [
          {
            question: 'Is there a reason to suspect that the prisoner is abusing drugs / alcohol?',
            answer: 'No',
          },
        ],
      }

      beforeEach(() => {
        prisonApi.getCsraReviewForBooking.mockResolvedValue(overrideReview)
        prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Moorland' })
        prisonApi.getStaffDetails.mockResolvedValue({ firstName: 'Staff', lastName: 'Two' })
      })

      describe('and all possible data', () => {
        it('should make the additional expected calls', async () => {
          await controller(req, res)

          expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'MDI')
          expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'USER2')
        })

        it('should render the correct template with the correct values', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCsraReview.njk', {
            breadcrumbPrisonerName: 'Smith, John',
            details: [
              {
                key: { text: 'CSRA' },
                value: { text: 'Standard - this is an override from Low' },
              },
              {
                key: { text: 'Override reason' },
                value: { text: 'Previous History' },
              },
              {
                key: { text: 'Authorised by' },
                value: { text: 'Review Board' },
              },
              {
                key: { classes: 'govuk-!-padding-top-6', text: 'Location' },
                value: { text: 'Moorland' },
              },
              {
                key: { text: 'Comments' },
                value: { text: 'Comments about the review' },
              },
              {
                key: { text: 'Reviewed by' },
                value: { text: 'Review Board - Staff Two' },
              },
              {
                key: { text: 'Next review date' },
                value: { text: '13 June 2011' },
              },
            ],
            profileUrl: `/prisoner/${offenderNo}`,
            reviewDate: '15 March 2011',
            reviewQuestions: [
              {
                question: 'Is there a reason to suspect that the prisoner is abusing drugs / alcohol?',
                answer: 'No',
              },
            ],
          })
        })
      })

      describe('and some not entered data', () => {
        it('should render the correct template with the correct values', async () => {
          prisonApi.getCsraReviewForBooking.mockResolvedValue({
            ...overrideReview,
            classificationReviewReason: undefined,
          })

          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerCsraReview.njk',
            expect.objectContaining({
              details: expect.arrayContaining([
                {
                  key: { text: 'CSRA' },
                  value: { text: 'Standard - this is an override from Low' },
                },
                {
                  key: { text: 'Override reason' },
                  value: { text: 'Not entered' },
                },
              ]),
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
})
