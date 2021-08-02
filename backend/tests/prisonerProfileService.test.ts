import config from '../config'
import prisonerProfileService from '../services/prisonerProfileService'

config.app.displayRetentionLink = true
// @ts-expect-error ts-migrate(2741) FIXME: Property 'timeoutSeconds' is missing in type '{ ui... Remove this comment to see the full error message
config.apis.pathfinder = {
  ui_url: 'http://pathfinder-ui/',
  url: 'http://pathfinder-api/',
}
// @ts-expect-error ts-migrate(2741) FIXME: Property 'timeoutSeconds' is missing in type '{ ur... Remove this comment to see the full error message
config.apis.soc = {
  url: 'http://soc-api/',
  ui_url: 'http://soc-ui/',
  enabled: true,
}

describe('prisoner profile service', () => {
  const context = {}
  const prisonApi = {}
  const keyworkerApi = {}
  const oauthApi = {}
  const pathfinderApi = {}
  const dataComplianceApi = {}
  const systemOauthClient = {}
  const allocationManagerApi = {}
  const socApi = {}
  const complexityApi = {}

  let service
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummary' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getIepSummary = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteSummaryByTypes' does not exis... Remove this comment to see the full error message
    prisonApi.getCaseNoteSummaryByTypes = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userCaseLoads = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getStaffRoles = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
    keyworkerApi.getKeyworkerByCaseloadAndOffenderNo = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.currentUser = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
    dataComplianceApi.getOffenderRetentionRecord = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
    allocationManagerApi.getPomByOffenderNo = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
    pathfinderApi.getPathfinderDetails = jest.fn().mockRejectedValue(new Error('not found'))
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
    socApi.getSocDetails = jest.fn().mockRejectedValue(new Error('not found'))

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
    complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})
    service = prisonerProfileService({
      prisonApi,
      keyworkerApi,
      oauthApi,
      dataComplianceApi,
      pathfinderApi,
      systemOauthClient,
      socApi,
      allocationManagerApi,
      complexityApi,
    })
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
        {
          alertId: 3,
          alertType: 'V',
          alertTypeDescription: 'Vulnerability',
          alertCode: 'VIP',
          alertCodeDescription: 'Isolated Prisoner',
          comment: 'test',
          dateCreated: '2020-08-20',
          expired: false,
          active: true,
          addedByFirstName: 'John',
          addedByLastName: 'Smith',
        },
      ],
      assignedLivingUnit: {
        description: 'CELL-123',
        agencyName: 'Moorland Closed',
      },
      bookingId,
      category: 'Cat C',
      csra: 'High',
      csraClassificationCode: 'HI',
      csraClassificationDate: '2016-11-23',
      firstName: 'TEST',
      inactiveAlertCount: 2,
      lastName: 'PRISONER',
      assessments: [
        {
          classification: 'High',
          assessmentCode: 'CSRREV',
          assessmentDescription: 'CSR Review',
          assessmentDate: '2016-11-23',
        },
        {
          classification: 'Standard',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR Rating',
          assessmentDate: '2020-08-18',
        },
        {
          classification: 'Cat C',
          assessmentCode: 'CATEGORY',
          assessmentDescription: 'Categorisation',
          assessmentDate: '2020-08-20',
        },
      ],
    }
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockReturnValue(prisonerDetails)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummary' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.getIepSummary.mockResolvedValue([{ iepLevel: 'Standard' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteSummaryByTypes' does not exis... Remove this comment to see the full error message
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.getStaffRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue({ firstName: 'STAFF', lastName: 'MEMBER' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
      dataComplianceApi.getOffenderRetentionRecord.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      allocationManagerApi.getPomByOffenderNo.mockReturnValue({ primary_pom: { name: 'SMITH, JANE' } })

      // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined[]' is not assignable to type 'stri... Remove this comment to see the full error message
      config.apis.complexity.enabled_prisons = []
    })

    it('should make a call for the full details including csra class for a prisoner and the current user', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      expect(oauthApi.currentUser).toHaveBeenCalledWith(context)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith(context, offenderNo, true)
    })

    it('should make calls for the additional details required for the prisoner profile', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummary' does not exist on type '{... Remove this comment to see the full error message
      expect(prisonApi.getIepSummary).toHaveBeenCalledWith(context, [bookingId])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteSummaryByTypes' does not exis... Remove this comment to see the full error message
      expect(prisonApi.getCaseNoteSummaryByTypes).toHaveBeenCalledWith(context, {
        type: 'KA',
        subType: 'KS',
        numMonths: 1,
        bookingId,
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      expect(keyworkerApi.getKeyworkerByCaseloadAndOffenderNo).toHaveBeenCalledWith(context, 'MDI', offenderNo)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      expect(oauthApi.userRoles).toHaveBeenCalledWith(context)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      expect(prisonApi.userCaseLoads).toHaveBeenCalledWith(context)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
      expect(prisonApi.getStaffRoles).toHaveBeenCalledWith(context, 111, 'MDI')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      expect(allocationManagerApi.getPomByOffenderNo).toHaveBeenCalledWith(context, offenderNo)
    })

    it('should return the correct prisoner information', async () => {
      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

      expect(getPrisonerProfileData).toEqual({
        canViewPathfinderLink: false,
        canViewProbationDocuments: false,
        pathfinderProfileUrl: null,
        pathfinderReferUrl: 'http://pathfinder-ui/refer/offender/ABC123',
        showPathfinderReferButton: false,
        categorisationLink: `http://localhost:3003/${bookingId}`,
        categorisationLinkText: '',
        activeAlertCount: 1,
        agencyName: 'Moorland Closed',
        socProfileUrl: null,
        canViewSocLink: false,
        showSocReferButton: false,
        socReferUrl: 'http://soc-ui/refer/offender/ABC123',
        alerts: [
          {
            alertCodes: ['XA'],
            classes: 'alert-status alert-status--arsonist',
            img: '/images/Arsonist_icon.png',
            label: 'Arsonist',
          },
        ],
        age: undefined,
        dateOfBirth: undefined,
        birthPlace: undefined,
        category: 'Cat C',
        csra: 'High',
        csraReviewDate: '23/11/2016',
        displayRetentionLink: true,
        inactiveAlertCount: 2,
        incentiveLevel: 'Standard',
        keyWorkerLastSession: '7 April 2020',
        keyWorkerName: 'Staff Member',
        location: 'CELL-123',
        offenderName: 'Prisoner, Test',
        offenderNo: 'ABC123',
        offenderRecordRetained: undefined,
        showAddKeyworkerSession: false,
        showReportUseOfForce: false,
        useOfForceUrl: '//useOfForceUrl/report/123/report-use-of-force',
        userCanEdit: false,
        staffId: 111,
        categoryCode: undefined,
        interpreterRequired: undefined,
        isHighComplexity: false,
        language: undefined,
        staffName: undefined,
        writtenLanguage: undefined,
        pomStaff: 'Jane Smith',
        physicalAttributes: undefined,
        physicalCharacteristics: undefined,
        physicalMarks: undefined,
        profileInformation: undefined,
        esweEnabled: false,
      })

      expect(getPrisonerProfileData).toEqual(
        expect.objectContaining({
          alerts: expect.not.arrayContaining([
            { alertCodes: ['VIP'], classes: 'alert-status alert-status--isolated-prisoner', label: 'Isolated' },
          ]),
        })
      )
    })

    it('should return the correct prisoner information when some data is missing', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockReturnValue({
        ...prisonerDetails,
        csraClassificationCode: undefined,
        csraClassificationDate: undefined,
        assessments: [],
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummary' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.getIepSummary.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteSummaryByTypes' does not exis... Remove this comment to see the full error message
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue(null)

      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

      expect(getPrisonerProfileData).toEqual(
        expect.objectContaining({
          incentiveLevel: undefined,
          keyWorkerLastSession: undefined,
          keyWorkerName: null,
          csra: undefined,
          csraReviewDate: undefined,
        })
      )
    })
    describe('prisoner profile links', () => {
      describe('when the the prisoner is out and user can view inactive bookings', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'INACTIVE_BOOKINGS' }])
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails.mockReturnValue({ ...prisonerDetails, agencyId: 'OUT' })
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
          prisonApi.getStaffRoles.mockResolvedValue([{ role: 'KW' }])
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

      describe('When the offender has a measured complexity of need', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string[]' is not assignable to type 'string'... Remove this comment to see the full error message
          config.apis.complexity.enabled_prisons = ['MDI']
        })

        it('should return false for offenders with no complexity of need data', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([])
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })
        it('should return false when the offender has a low complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'low' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)
          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })

        it('should return false when the offender has a medium complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'medium' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })

        it('should return true when the offender has a high complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'high' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: true,
            })
          )
        })

        it('should only check for complex offenders when the feature is enabled', async () => {
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string[]' is not assignable to type 'string'... Remove this comment to see the full error message
          config.apis.complexity.enabled_prisons = ['LEI']

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          expect(complexityApi.getComplexOffenders).not.toHaveBeenCalled()
        })

        it('should use client credentials when making request to the complexity api', async () => {
          const systemContext = { client_creds: true }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'high' }])
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
          systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue(systemContext)

          await service.getPrisonerProfileData(context, offenderNo)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          expect(complexityApi.getComplexOffenders).toHaveBeenCalledWith(systemContext, ['ABC123'])
        })
      })

      describe('when the user is in a use of force prison', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
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

      describe('when the user has the VIEW_PROBATION_DOCUMENTS role', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
        })

        it('should let the user view probation documents', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              canViewProbationDocuments: true,
            })
          )
        })
      })

      describe('when the user has the POM role', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'POM' }])
        })

        it('should let the user view probation documents', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              canViewProbationDocuments: true,
            })
          )
        })
      })
    })

    describe('when the prisoner has a data retention record', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
        dataComplianceApi.getOffenderRetentionRecord.mockReturnValue({ retentionReasons: ['Reason 1'] })
      })

      it('should let the template know there is a record retained', async () => {
        const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(getPrisonerProfileData).toEqual(
          expect.objectContaining({
            offenderRecordRetained: true,
          })
        )
      })
    })

    describe('when there are errors with retrieving information', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummary' does not exist on type '{... Remove this comment to see the full error message
        prisonApi.getIepSummary.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteSummaryByTypes' does not exis... Remove this comment to see the full error message
        prisonApi.getCaseNoteSummaryByTypes.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
        prisonApi.userCaseLoads.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
        prisonApi.getStaffRoles.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
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

    describe('when a pathfinder prisoner exists and the current user has the correct role', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockResolvedValue({ id: 1 })
      })

      it('should make client credentials call passing the username', async () => {
        await service.getPrisonerProfileData(context, offenderNo, 'user1')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledWith('user1')
      })

      it('should make a call to the path finder api', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({ system: true })

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        expect(pathfinderApi.getPathfinderDetails).toHaveBeenCalledWith({ system: true }, offenderNo)
        expect(profileData.canViewPathfinderLink).toBe(false)
      })

      it.each`
        role                    | flag                       | hasAccess
        ${'PF_STD_PRISON'}      | ${'canViewPathfinderLink'} | ${true}
        ${'PF_STD_PROBATION'}   | ${'canViewPathfinderLink'} | ${true}
        ${'PF_APPROVAL'}        | ${'canViewPathfinderLink'} | ${true}
        ${'PF_NATIONAL_READER'} | ${'canViewPathfinderLink'} | ${true}
        ${'PF_LOCAL_READER'}    | ${'canViewPathfinderLink'} | ${true}
        ${'PF_HQ'}              | ${'canViewPathfinderLink'} | ${true}
        ${'PF_PSYCHOLOGIST'}    | ${'canViewPathfinderLink'} | ${true}
        ${'PF_POLICE'}          | ${'canViewPathfinderLink'} | ${true}
        ${'PF_NATIONAL_READER'} | ${'canViewPathfinderLink'} | ${true}
        ${'PF_LOCAL_READER'}    | ${'canViewPathfinderLink'} | ${true}
        ${'OTHER'}              | ${'canViewPathfinderLink'} | ${false}
      `('$flag should be $hasAccess when the user has the $role role', async ({ role, flag, hasAccess }) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: role }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData[flag]).toBe(hasAccess)
        expect(profileData.pathfinderProfileUrl).toBe('http://pathfinder-ui/nominal/1')
      })

      it('should not enable pathfinder link when the offender does not exists on pathfinder', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockRejectedValue(new Error('not found'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PF_STD_PROBATION_RO' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.canViewPathfinderLink).toBe(false)
      })
    })

    describe('allowing pathfinder referrals based on roles and current offender status', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockResolvedValue(undefined)
      })

      it.each`
        role                    | flag                           | hasAccess
        ${'PF_STD_PRISON'}      | ${'showPathfinderReferButton'} | ${true}
        ${'PF_STD_PROBATION'}   | ${'showPathfinderReferButton'} | ${true}
        ${'PF_APPROVAL'}        | ${'showPathfinderReferButton'} | ${true}
        ${'PF_NATIONAL_READER'} | ${'showPathfinderReferButton'} | ${false}
        ${'PF_LOCAL_READER'}    | ${'showPathfinderReferButton'} | ${false}
        ${'PF_HQ'}              | ${'showPathfinderReferButton'} | ${true}
        ${'PF_PSYCHOLOGIST'}    | ${'showPathfinderReferButton'} | ${false}
        ${'PF_POLICE'}          | ${'showPathfinderReferButton'} | ${false}
        ${'PF_NATIONAL_READER'} | ${'showPathfinderReferButton'} | ${false}
        ${'PF_LOCAL_READER'}    | ${'showPathfinderReferButton'} | ${false}
        ${'OTHER'}              | ${'showPathfinderReferButton'} | ${false}
      `('$flag should be $hasAccess when the user has the $role role', async ({ role, flag, hasAccess }) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: role }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData[flag]).toBe(hasAccess)
      })

      it('should not display pathfinder referral when the offender exists on pathfinder', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockResolvedValue({ id: 1 })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PF_STD_PROBATION' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.showPathfinderReferButton).toBe(false)
      })
    })

    describe('when a SOC prisoner exists and the current user has the correct role', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
        socApi.getSocDetails = jest.fn().mockResolvedValue({ id: 1 })
      })

      it('should make client credentials call passing the username', async () => {
        await service.getPrisonerProfileData(context, offenderNo, 'user1')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledWith('user1')
      })

      it('should make a call to the SOC API', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({ system: true })

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
        expect(socApi.getSocDetails).toHaveBeenCalledWith({ system: true }, offenderNo, true)
        expect(profileData.canViewSocLink).toBe(false)
      })

      it('should enable SOC when the user has the SOC_CUSTODY role', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_CUSTODY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.canViewSocLink).toBe(true)
        expect(profileData.socProfileUrl).toBe('http://soc-ui/nominal/1')
      })

      it('should enable SOC when the user has the SOC_COMMUNITY role', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_COMMUNITY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.canViewSocLink).toBe(true)
      })

      it('should not enable SOC link when the offender does not exists on SOC', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
        socApi.getSocDetails = jest.fn().mockRejectedValue(new Error('not found'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_CUSTODY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.canViewSocLink).toBe(false)
      })
    })

    describe('when a prisoner is in CSWAP', () => {
      it('should show the CSWAP location description', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        prisonApi.getDetails.mockReturnValue({
          ...prisonerDetails,
          assignedLivingUnit: {
            ...prisonerDetails.assignedLivingUnit,
            description: 'CSWAP',
          },
        })

        const profileData = await service.getPrisonerProfileData(context, offenderNo)

        expect(profileData.location).toBe('No cell allocated')
      })
    })
  })
})
