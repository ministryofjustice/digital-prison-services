const prisonerProfileService = require('../services/prisonerProfileService')

describe('prisoner profile service', () => {
  const context = {}
  const elite2Api = {}
  const keyworkerApi = {}
  const oauthApi = {}
  let service

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getIepSummary = jest.fn()
    elite2Api.getCaseNoteSummaryByTypes = jest.fn()
    elite2Api.userCaseLoads = jest.fn()
    elite2Api.getStaffRoles = jest.fn()
    keyworkerApi.getKeyworkerByCaseloadAndOffenderNo = jest.fn()
    oauthApi.userRoles = jest.fn()
    oauthApi.currentUser = jest.fn()
    service = prisonerProfileService(elite2Api, keyworkerApi, oauthApi)
  })

  describe('prisoner profile data', () => {
    const offenderNo = 'ABC123'
    const bookingId = '123'
    const prisonerDetails = {
      activeAlertCount: 1,
      agencyId: 'MDI',
      alerts: [
        {
          alertId: 1,
          alertType: 'X',
          alertTypeDescription: 'Security',
          alertCode: 'XA',
          alertCodeDescription: 'Arsonist',
          comment: 'Testing alerts',
          dateCreated: '2019-09-11',
          expired: false,
          active: true,
          addedByFirstName: 'OFFICER',
          addedByLastName: 'ONE',
        },
        {
          alertId: 2,
          alertType: 'P',
          alertTypeDescription: 'MAPPP Case',
          alertCode: 'PC3',
          alertCodeDescription: 'MAPPA Cat 3',
          comment: 'Testing alerts',
          dateCreated: '2019-09-11',
          expired: false,
          active: true,
          addedByFirstName: 'OFFICER',
          addedByLastName: 'TWO',
        },
      ],
      assignedLivingUnit: {
        description: 'CELL-123',
        agencyName: 'Moorland Closed',
      },
      bookingId,
      category: 'Cat C',
      csra: 'High',
      firstName: 'TEST',
      inactiveAlertCount: 2,
      lastName: 'PRISONER',
    }

    beforeEach(() => {
      elite2Api.getDetails.mockReturnValue(prisonerDetails)
      elite2Api.getIepSummary.mockResolvedValue([{ iepLevel: 'Standard' }])
      elite2Api.getCaseNoteSummaryByTypes.mockResolvedValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      elite2Api.getStaffRoles.mockResolvedValue([])
      elite2Api.userCaseLoads.mockResolvedValue([])
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue({ firstName: 'STAFF', lastName: 'MEMBER' })
      oauthApi.userRoles.mockResolvedValue([])
      oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
    })

    it('should make a call for the full details for a prisoner and the current user', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      expect(oauthApi.currentUser).toHaveBeenCalledWith(context)
      expect(elite2Api.getDetails).toHaveBeenCalledWith(context, offenderNo, true, true)
    })

    it('should make calls for the additional details required for the prisoner profile', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      expect(elite2Api.getIepSummary).toHaveBeenCalledWith(context, [bookingId])
      expect(elite2Api.getCaseNoteSummaryByTypes).toHaveBeenCalledWith(context, {
        type: 'KA',
        subType: 'KS',
        numMonths: 1,
        bookingId,
      })
      expect(keyworkerApi.getKeyworkerByCaseloadAndOffenderNo).toHaveBeenCalledWith(context, 'MDI', offenderNo)
      expect(oauthApi.userRoles).toHaveBeenCalledWith(context)
      expect(elite2Api.userCaseLoads).toHaveBeenCalledWith(context)
      expect(elite2Api.getStaffRoles).toHaveBeenCalledWith(context, 111, 'MDI')
    })

    it('should return the correct prisoner information', async () => {
      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

      expect(getPrisonerProfileData).toEqual({
        categorisationLink: `http://localhost:3003/${bookingId}`,
        categorisationLinkText: '',
        activeAlertCount: 1,
        agencyName: 'Moorland Closed',
        alerts: [
          {
            alertCodes: ['XA'],
            classes: 'alert-status alert-status--arsonist',
            img: '/images/Arsonist_icon.png',
            label: 'Arsonist',
          },
        ],
        category: 'Cat C',
        csra: 'High',
        inactiveAlertCount: 2,
        incentiveLevel: 'Standard',
        keyWorkerLastSession: '07/04/2020',
        keyWorkerName: 'Member, Staff',
        location: 'CELL-123',
        notmEndpointUrl: 'http://localhost:3000/',
        offenderName: 'Prisoner, Test',
        offenderNo: 'ABC123',
        showAddKeyworkerSession: false,
        showReportUseOfForce: false,
        useOfForceUrl: '//useOfForceUrl',
        userCanEdit: false,
      })
    })

    it('should return the correct prisoner information when some data is missing', async () => {
      elite2Api.getIepSummary.mockResolvedValue([])
      elite2Api.getCaseNoteSummaryByTypes.mockResolvedValue([])
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue(null)

      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

      expect(getPrisonerProfileData).toEqual(
        expect.objectContaining({
          incentiveLevel: undefined,
          keyWorkerLastSession: undefined,
          keyWorkerName: null,
        })
      )
    })

    describe('prisoner profile links', () => {
      describe('when the the prisoner is out and user can view inactive bookings', () => {
        beforeEach(() => {
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'INACTIVE_BOOKINGS' }])
          elite2Api.getDetails.mockReturnValue({ ...prisonerDetails, agencyId: 'OUT' })
        })

        it('should allow the user to edit', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              userCanEdit: true,
            })
          )
        })
      })

      describe('when the prisoner is in the users caseload', () => {
        beforeEach(() => {
          elite2Api.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
        })

        it('should allow the user to edit and show correct category link text', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              categorisationLinkText: 'View category',
              userCanEdit: true,
            })
          )
        })
      })

      describe('when the user has categorisation roles', () => {
        beforeEach(() => {
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'CREATE_CATEGORISATION' }])
        })

        it('should show correct category link text', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              categorisationLinkText: 'Manage category',
            })
          )
        })
      })

      describe('when the user is a keyworker', () => {
        beforeEach(() => {
          elite2Api.getStaffRoles.mockResolvedValue([{ role: 'KW' }])
        })

        it('should enable the user to add a keyworker session', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showAddKeyworkerSession: true,
            })
          )
        })
      })

      describe('when the user is in a use of force prison', () => {
        beforeEach(() => {
          oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'LEI' })
        })

        it('should enable the user to report use of force', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showReportUseOfForce: true,
            })
          )
        })
      })
    })

    describe('when there are errors with retrieving information', () => {
      beforeEach(() => {
        elite2Api.getIepSummary.mockRejectedValue(new Error('Network error'))
        elite2Api.getCaseNoteSummaryByTypes.mockRejectedValue(new Error('Network error'))
        elite2Api.userCaseLoads.mockRejectedValue(new Error('Network error'))
        elite2Api.getStaffRoles.mockRejectedValue(new Error('Network error'))
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockRejectedValue(new Error('Network error'))
        oauthApi.userRoles.mockRejectedValue(new Error('Network error'))
      })

      it('should still pass those values as null', async () => {
        const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(getPrisonerProfileData).toEqual(
          expect.objectContaining({
            incentiveLevel: null,
            keyWorkerLastSession: null,
            showAddKeyworkerSession: null,
            userCanEdit: null,
          })
        )
      })
    })
  })
})
