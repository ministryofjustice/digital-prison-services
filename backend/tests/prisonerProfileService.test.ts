import config from '../config'
import prisonerProfileService from '../services/prisonerProfileService'
import { makeNotFoundError } from './helpers'
import type apis from '../apis'
import {
  NeurodivergenceAssessed,
  NeurodivergenceSelfDeclared,
  NeurodivergenceSupport,
} from '../api/curious/types/Enums'

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

config.apis.calculateReleaseDates = {
  ui_url: 'http://crd-ui/',
}

config.app.neurodiversityEnabledPrisons = ['NOT-ACCELERATED', 'LEI']

config.app.sunsetBannerEnabled = true

describe('prisoner profile service', () => {
  const context = {}
  const prisonApi = {} as jest.Mocked<typeof apis.prisonApi>
  const keyworkerApi = {}
  const oauthApi = {} as jest.Mocked<typeof apis.oauthApi>
  const hmppsManageUsersApi = {} as jest.Mocked<typeof apis.hmppsManageUsersApi>
  const pathfinderApi = {}
  const dataComplianceApi = {}
  const systemOauthClient = {}
  const allocationManagerApi = {}
  const socApi = {}
  const complexityApi = {}
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>
  const curiousApi = {}
  const offenderSearchApi = {}

  let service
  beforeEach(() => {
    prisonApi.getDetails = jest.fn()
    incentivesApi.getIepSummaryForBookingIds = jest.fn()
    prisonApi.getCaseNoteSummaryByTypes = jest.fn()
    prisonApi.userCaseLoads = jest.fn()
    prisonApi.getStaffRoles = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
    keyworkerApi.getKeyworkerByCaseloadAndOffenderNo = jest.fn()
    oauthApi.userRoles = jest.fn()
    hmppsManageUsersApi.currentUser = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
    dataComplianceApi.getOffenderRetentionRecord = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
    allocationManagerApi.getPomByOffenderNo = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
    pathfinderApi.getPathfinderDetails = jest.fn().mockRejectedValue(new Error('not found'))
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
    socApi.getSocDetails = jest.fn().mockRejectedValue(new Error('not found'))

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLearnerNeurodivergence' does not exist on t... Remove this comment to see the full error message
    curiousApi.getLearnerNeurodivergence = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
    complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
    offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})
    service = prisonerProfileService({
      prisonApi,
      keyworkerApi,
      oauthApi,
      hmppsManageUsersApi,
      dataComplianceApi,
      pathfinderApi,
      systemOauthClient,
      socApi,
      allocationManagerApi,
      complexityApi,
      incentivesApi,
      curiousApi,
      offenderSearchApi,
    })
  })
  describe('prisoner profile data', () => {
    const offenderNo = 'ABC123'
    const bookingId = 123

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
      prisonApi.getDetails.mockReturnValue(prisonerDetails)
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([{ bookingId, iepLevel: 'Standard' }])
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      prisonApi.getStaffRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue({ firstName: 'STAFF', lastName: 'MEMBER' })
      oauthApi.userRoles.mockReturnValue([])
      hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
      dataComplianceApi.getOffenderRetentionRecord.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      allocationManagerApi.getPomByOffenderNo.mockResolvedValue({ primary_pom: { name: 'SMITH, JANE' } })
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined[]' is not assignable to type 'stri... Remove this comment to see the full error message
      config.apis.complexity.enabled_prisons = []
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLearnerNeurodivergence' does not exist on ty... Remove this comment to see the full error message
      curiousApi.getLearnerNeurodivergence.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on ty... Remove this comment to see the full error message
      offenderSearchApi.getPrisonersDetails.mockResolvedValue([
        { indeterminateSentence: false, restrictedPatient: false },
      ])
    })

    it('should make a call for the full details including csra class for a prisoner and the current user', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      expect(hmppsManageUsersApi.currentUser).toHaveBeenCalledWith(context)
      expect(prisonApi.getDetails).toHaveBeenCalledWith(context, offenderNo, true)
    })

    it('should make calls for the additional details required for the prisoner profile', async () => {
      await service.getPrisonerProfileData(context, offenderNo)

      expect(incentivesApi.getIepSummaryForBookingIds).toHaveBeenCalledWith(context, [bookingId])
      expect(prisonApi.getCaseNoteSummaryByTypes).toHaveBeenCalledWith(context, {
        type: 'KA',
        subType: 'KS',
        numMonths: 1,
        bookingId,
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      expect(keyworkerApi.getKeyworkerByCaseloadAndOffenderNo).toHaveBeenCalledWith(context, 'MDI', offenderNo)
      expect(oauthApi.userRoles).toHaveBeenCalledWith(context)
      expect(prisonApi.userCaseLoads).toHaveBeenCalledWith(context)
      expect(prisonApi.getStaffRoles).toHaveBeenCalledWith(context, 111, 'MDI')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      expect(allocationManagerApi.getPomByOffenderNo).toHaveBeenCalledWith(context, offenderNo)
    })

    it('should return the correct prisoner information', async () => {
      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
            classes: 'alert-status alert-status--security',
            label: 'Arsonist',
          },
          {
            alertCodes: ['VIP'],
            classes: 'alert-status alert-status--isolated-prisoner',
            label: 'Isolated',
          },
        ],
        age: undefined,
        dateOfBirth: undefined,
        birthPlace: undefined,
        calculateReleaseDatesUrl: 'http://crd-ui/?prisonId=ABC123',
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
        showAddAppointment: true,
        showAddKeyworkerSession: false,
        showCalculateReleaseDates: false,
        showCellHistoryLink: true,
        showCsraHistory: true,
        showFinanceDetailLinks: true,
        showIncentiveDetailLink: true,
        showIncentiveLevelDetails: true,
        showReportUseOfForce: false,
        showScheduleDetailLink: true,
        showWorkAndSkillsTab: true,
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
        hasDivergenceSupport: false,
        indeterminateSentence: false,
        sunsetBannerEnabled: true,
      })
    })

    it('should return the correct prisoner information when some data is missing', async () => {
      prisonApi.getDetails.mockReturnValue({
        ...prisonerDetails,
        csraClassificationCode: undefined,
        csraClassificationDate: undefined,
        assessments: [],
      })
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([])
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue(null)

      const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'INACTIVE_BOOKINGS' }])
          prisonApi.getDetails.mockReturnValue({ ...prisonerDetails, agencyId: 'OUT' })
        })

        it('should allow the user to edit', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'CREATE_CATEGORISATION' }])
        })

        it('should show correct category link text', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              categorisationLinkText: 'Manage category',
            })
          )
        })
      })

      describe('when the user is a keyworker', () => {
        beforeEach(() => {
          prisonApi.getStaffRoles.mockResolvedValue([{ role: 'KW' }])
        })

        it('should enable the user to add a keyworker session', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })
        it('should return false when the offender has a low complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'low' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)
          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })

        it('should return false when the offender has a medium complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'medium' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: false,
            })
          )
        })

        it('should return true when the offender has a high complexity of need', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getComplexOffenders' does not exist on t... Remove this comment to see the full error message
          complexityApi.getComplexOffenders = jest.fn().mockResolvedValue([{ offenderNo, level: 'high' }])

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              isHighComplexity: true,
            })
          )
        })

        it('should only check for complex offenders when the feature is enabled', async () => {
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string[]' is not assignable to type 'string'... Remove this comment to see the full error message
          config.apis.complexity.enabled_prisons = ['LEI']

          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'LEI' })
        })

        it('should enable the user to report use of force', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showReportUseOfForce: true,
            })
          )
        })
      })

      describe('when the user has the VIEW_PROBATION_DOCUMENTS role', () => {
        beforeEach(() => {
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
        })

        describe('when prisoner is in active caseload', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339)
            prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
            hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
          })
          it('should let the user view probation documents', async () => {
            const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

            expect(getPrisonerProfileData).toEqual(
              expect.objectContaining({
                canViewProbationDocuments: true,
              })
            )
          })
        })
        describe('when prisoner is in another one for your caseload', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339)
            prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }])
            hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'LEI' })
          })
          it('should let the user view probation documents', async () => {
            const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

            expect(getPrisonerProfileData).toEqual(
              expect.objectContaining({
                canViewProbationDocuments: true,
              })
            )
          })
        })
        describe('when prisoner is not in any of your caseloads', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339)
            prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'BXI' }, { caseLoadId: 'WWI' }])
            hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })
          })
          it('should let the user view probation documents', async () => {
            const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

            expect(getPrisonerProfileData).toEqual(
              expect.objectContaining({
                canViewProbationDocuments: false,
              })
            )
          })
        })
        describe('when prisoner is OUT of prison', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339)
            prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
            hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
            prisonApi.getDetails.mockReturnValue({
              ...prisonerDetails,
              agencyId: 'OUT',
            })
          })
          it('should let the user view probation documents', async () => {
            const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

            expect(getPrisonerProfileData).toEqual(
              expect.objectContaining({
                canViewProbationDocuments: false,
              })
            )
          })
        })
      })

      describe('when the user has the POM role', () => {
        beforeEach(() => {
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'POM' }])
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
        })

        it('should let the user view probation documents', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
        const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(getPrisonerProfileData).toEqual(
          expect.objectContaining({
            offenderRecordRetained: true,
          })
        )
      })
    })

    describe('when there are errors with retrieving information', () => {
      beforeEach(() => {
        incentivesApi.getIepSummaryForBookingIds.mockRejectedValue(new Error('Network error'))
        prisonApi.getCaseNoteSummaryByTypes.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
        prisonApi.userCaseLoads.mockRejectedValue(new Error('Network error'))
        prisonApi.getStaffRoles.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockRejectedValue(new Error('Network error'))
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
        allocationManagerApi.getPomByOffenderNo.mockRejectedValue(new Error('Network error'))
      })

      it('should still pass those values as null', async () => {
        const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(getPrisonerProfileData).toEqual(
          expect.objectContaining({
            incentiveLevel: null,
            keyWorkerLastSession: null,
            showAddKeyworkerSession: null,
            userCanEdit: false,
            pomStaff: undefined,
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

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        expect(pathfinderApi.getPathfinderDetails).toHaveBeenCalledWith({ system: true }, offenderNo)
        expect(profileData.canViewPathfinderLink).toBe(false)
      })

      it.each`
        role                    | flag                       | hasAccess
        ${'PF_ADMIN'}           | ${'canViewPathfinderLink'} | ${true}
        ${'PF_USER'}            | ${'canViewPathfinderLink'} | ${true}
        ${'PF_STD_PRISON'}      | ${'canViewPathfinderLink'} | ${true}
        ${'PF_STD_PROBATION'}   | ${'canViewPathfinderLink'} | ${true}
        ${'PF_APPROVAL'}        | ${'canViewPathfinderLink'} | ${true}
        ${'PF_NATIONAL_READER'} | ${'canViewPathfinderLink'} | ${true}
        ${'PF_LOCAL_READER'}    | ${'canViewPathfinderLink'} | ${true}
        ${'PF_HQ'}              | ${'canViewPathfinderLink'} | ${true}
        ${'PF_PSYCHOLOGIST'}    | ${'canViewPathfinderLink'} | ${true}
        ${'PF_POLICE'}          | ${'canViewPathfinderLink'} | ${true}
        ${'OTHER'}              | ${'canViewPathfinderLink'} | ${false}
      `('$flag should be $hasAccess when the user has the $role role', async ({ role, flag, hasAccess }) => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: role }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData[flag]).toBe(hasAccess)
        expect(profileData.pathfinderProfileUrl).toBe('http://pathfinder-ui/nominal/1')
      })

      it('should not enable pathfinder link when the offender does not exists on pathfinder', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockRejectedValue(new Error('not found'))
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'PF_STD_PROBATION_RO' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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
        ${'PF_USER'}            | ${'showPathfinderReferButton'} | ${true}
        ${'PF_STD_PRISON'}      | ${'showPathfinderReferButton'} | ${true}
        ${'PF_STD_PROBATION'}   | ${'showPathfinderReferButton'} | ${true}
        ${'PF_APPROVAL'}        | ${'showPathfinderReferButton'} | ${true}
        ${'PF_NATIONAL_READER'} | ${'showPathfinderReferButton'} | ${false}
        ${'PF_LOCAL_READER'}    | ${'showPathfinderReferButton'} | ${false}
        ${'PF_HQ'}              | ${'showPathfinderReferButton'} | ${true}
        ${'PF_PSYCHOLOGIST'}    | ${'showPathfinderReferButton'} | ${false}
        ${'PF_POLICE'}          | ${'showPathfinderReferButton'} | ${false}
        ${'OTHER'}              | ${'showPathfinderReferButton'} | ${false}
      `('$flag should be $hasAccess when the user has the $role role', async ({ role, flag, hasAccess }) => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: role }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData[flag]).toBe(hasAccess)
      })

      it('should not display pathfinder referral when the offender exists on pathfinder', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPathfinderDetails' does not exist on ... Remove this comment to see the full error message
        pathfinderApi.getPathfinderDetails = jest.fn().mockResolvedValue({ id: 1 })
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'PF_STD_PROBATION' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

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

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
        expect(socApi.getSocDetails).toHaveBeenCalledWith({ system: true }, offenderNo, true)
        expect(profileData.canViewSocLink).toBe(false)
      })

      it('should enable SOC when the user has the SOC_CUSTODY role', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOC_CUSTODY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData.canViewSocLink).toBe(true)
        expect(profileData.socProfileUrl).toBe('http://soc-ui/nominal/1')
      })

      it('should enable SOC when the user has the SOC_COMMUNITY role', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOC_COMMUNITY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData.canViewSocLink).toBe(true)
      })

      it('should not enable SOC link when the offender does not exists on SOC', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSocDetails' does not exist on type '{... Remove this comment to see the full error message
        socApi.getSocDetails = jest.fn().mockRejectedValue(new Error('not found'))
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOC_CUSTODY' }])

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData.canViewSocLink).toBe(false)
      })
    })

    describe('when a prisoner is in CSWAP', () => {
      it('should show the CSWAP location description', async () => {
        prisonApi.getDetails.mockReturnValue({
          ...prisonerDetails,
          assignedLivingUnit: {
            ...prisonerDetails.assignedLivingUnit,
            description: 'CSWAP',
          },
        })

        const profileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

        expect(profileData.location).toBe('No cell allocated')
      })
    })
    describe('when the user has the RELEASE_DATES_CALCULATOR role', () => {
      beforeEach(() => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'RELEASE_DATES_CALCULATOR' }])
      })

      describe('when prisoner is in active caseload', () => {
        beforeEach(() => {
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }] as never)
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
        })
        it('should show the user the calculate release dates button', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showCalculateReleaseDates: true,
              calculateReleaseDatesUrl: 'http://crd-ui/?prisonId=ABC123',
            })
          )
        })
      })
      describe('when prisoner is not in active caseload', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'LEI' }])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
        })
        it('should not show the user the calculate release dates button', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showCalculateReleaseDates: false,
            })
          )
        })
      })
    })
    describe('when the user does not have the RELEASE_DATES_CALCULATOR role', () => {
      describe('when prisoner is in active caseload', () => {
        beforeEach(() => {
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }] as never)
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
        })
        it('should not show the user the calculate release dates button', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showCalculateReleaseDates: false,
            })
          )
        })
      })
    })
    describe('when the user is viewing a Restricted Patient', () => {
      describe(`when the user is a POM with a caseload including the patients previous prison`, () => {
        let getPrisonerProfileData

        beforeEach(async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
          offenderSearchApi.getPrisonersDetails.mockResolvedValue([
            { restrictedPatient: true, dischargedHospitalDescription: 'some hospital' },
          ])
          getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', true)
        })
        it('should allow editing', async () => {
          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              userCanEdit: true,
            })
          )
        })
        it('should restrict the links available', async () => {
          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              showReportUseOfForce: false,
              showAddAppointment: false,
              showCsraHistory: false,
              showIncentiveLevelDetails: false,
              showFinanceDetailLinks: false,
              showScheduleDetailLink: false,
              showIncentiveDetailLink: false,
              showCellHistoryLink: false,
              showWorkAndSkillsTab: false,
            })
          )
        })
        it('should show the hospital location', async () => {
          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              location: 'some hospital',
            })
          )
        })
      })
      describe(`when the user is NOT a POM with a caseload including the patients previous prison`, () => {
        beforeEach(async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
          offenderSearchApi.getPrisonersDetails.mockResolvedValue([{ restrictedPatient: false }])
        })
        it('should not allow editing', async () => {
          const getPrisonerProfileData = await service.getPrisonerProfileData(context, offenderNo, '', false)

          expect(getPrisonerProfileData).toEqual(
            expect.objectContaining({
              userCanEdit: false,
            })
          )
        })
      })
    })
  })

  describe('prisoner with neurodiversity support', () => {
    const offenderNo = 'ABC123'
    const bookingId = 123

    const neurodivergenceData = {
      prn: offenderNo,
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      neurodivergenceSelfDeclared: [NeurodivergenceSelfDeclared.ADHD, NeurodivergenceSelfDeclared.Autism],
      selfDeclaredDate: '2022-02-10',
      neurodivergenceAssessed: [NeurodivergenceAssessed.AcquiredBrainInjury],
      assessmentDate: '2022-02-15',
      neurodivergenceSupport: [NeurodivergenceSupport.MemorySupport, NeurodivergenceSupport.Reading],
      supportDate: '2022-02-20',
    }
    const prisonerDetails = {
      activeAlertCount: 1,
      agencyId: 'LEI',
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
      prisonApi.getDetails.mockReturnValue(prisonerDetails)
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([{ bookingId, iepLevel: 'Standard' }])
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      prisonApi.getStaffRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue({ firstName: 'STAFF', lastName: 'MEMBER' })
      oauthApi.userRoles.mockReturnValue([])
      hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
      dataComplianceApi.getOffenderRetentionRecord.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      allocationManagerApi.getPomByOffenderNo.mockResolvedValue({ primary_pom: { name: 'SMITH, JANE' } })
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined[]' is not assignable to type 'stri... Remove this comment to see the full error message
      config.apis.complexity.enabled_prisons = []
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLearnerNeurodivergence' does not exist on ty... Remove this comment to see the full error message
      curiousApi.getLearnerNeurodivergence.mockResolvedValue([neurodivergenceData])
    })

    it('should return true when a user has neurodiversity support needs', async () => {
      const response = await service.getPrisonerProfileData(context, offenderNo)

      expect(hmppsManageUsersApi.currentUser).toHaveBeenCalledWith(context)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(curiousApi.getLearnerNeurodivergence).toHaveBeenCalledTimes(1)
      expect(response.hasDivergenceSupport).toEqual(true)
    })
  })
  describe('prisoner with no neurodiversity support', () => {
    const offenderNo = 'ABC123'
    const bookingId = 123

    const neurodivergenceDataNoSupport = {
      prn: offenderNo,
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      neurodivergenceSupport: [],
    }
    const neurodivergenceDataNoSupportIdentified = {
      prn: offenderNo,
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      neurodivergenceSupport: [NeurodivergenceSupport.NoIdentifiedNeurodiversityNeed],
    }
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
      assessments: [],
    }

    beforeEach(() => {
      prisonApi.getDetails.mockReturnValue(prisonerDetails)
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([{ bookingId, iepLevel: 'Standard' }])
      prisonApi.getCaseNoteSummaryByTypes.mockResolvedValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      prisonApi.getStaffRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getKeyworkerByCaseloadAndOffenderNo' doe... Remove this comment to see the full error message
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockResolvedValue({ firstName: 'STAFF', lastName: 'MEMBER' })
      oauthApi.userRoles.mockReturnValue([])
      hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
      dataComplianceApi.getOffenderRetentionRecord.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      allocationManagerApi.getPomByOffenderNo.mockResolvedValue({ primary_pom: { name: 'SMITH, JANE' } })
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined[]' is not assignable to type 'stri... Remove this comment to see the full error message
      config.apis.complexity.enabled_prisons = []
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLearnerNeurodivergence' does not exist on ty... Remove this comment to see the full error message
      curiousApi.getLearnerNeurodivergence.mockResolvedValue([neurodivergenceDataNoSupport])
    })

    it('should return false when user has no neurodiversity data', async () => {
      const response = await service.getPrisonerProfileData(context, offenderNo)
      expect(response.hasDivergenceSupport).toEqual(false)
    })
    it('should return false when no neurodiversity support needs are identified', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      curiousApi.getLearnerNeurodivergence.mockResolvedValue([neurodivergenceDataNoSupportIdentified])

      const response = await service.getPrisonerProfileData(context, offenderNo)
      expect(response.hasDivergenceSupport).toEqual(false)
    })
    it('should handle the not found error', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      curiousApi.getLearnerNeurodivergence.mockRejectedValue(makeNotFoundError())

      const response = await service.getPrisonerProfileData(context, offenderNo)
      expect(response.hasDivergenceSupport).toEqual(false)
    })
    it('should return false when caseload not an accelerated prison', async () => {
      const neurodivergenceData = {
        prn: offenderNo,
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        neurodivergenceSelfDeclared: [],
        selfDeclaredDate: null,
        neurodivergenceAssessed: [],
        assessmentDate: null,
        neurodivergenceSupport: [NeurodivergenceSupport.MemorySupport, NeurodivergenceSupport.Reading],
        supportDate: '2022-02-20',
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      curiousApi.getLearnerNeurodivergence.mockResolvedValue([neurodivergenceData])

      const response = await service.getPrisonerProfileData(context, offenderNo)
      expect(response.hasDivergenceSupport).toEqual(false)
    })
  })
})
