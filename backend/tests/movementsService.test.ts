import type apis from '../apis'
import { movementsServiceFactory } from '../services/movementsService'

describe('Movement service', () => {
  const prisonApi = {}
  const oauthClient = {}
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>
  const context = {}
  const agency = 'LEI'
  const offenders = [
    { offenderNo: 'offenderNo1', bookingId: 1 },
    { offenderNo: 'offenderNo2', bookingId: 2 },
  ]
  const offenderNumbers = offenders.map((offender) => offender.offenderNo)
  const alertFlags = [
    {
      offenderNo: offenderNumbers[0],
      expired: true,
      alertCode: 'HA',
    },
    {
      offenderNo: offenderNumbers[0],
      expired: false,
      alertCode: 'HA',
    },
    {
      offenderNo: offenderNumbers[0],
      expired: true,
      alertCode: 'XEL',
    },
    {
      offenderNo: offenderNumbers[0],
      expired: false,
      alertCode: 'XEL',
    },
  ]

  const recentMovementDefaults = {
    fromAgencyDescription: undefined,
    fromAgency: undefined,
    toAgency: undefined,
    toAgencyDescription: undefined,
    commentText: undefined,
  }

  describe('Out today', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getMovementsOut = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getAssessments = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('handles no offenders out today', async () => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      const response = await movementsServiceFactory(prisonApi).getMovementsOut({}, 'LEI')
      expect(response).toEqual([])
    })

    it('handles no assessments and no alerts', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getMovementsOut.mockReturnValue(offenders)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(
        context,
        agency
      )

      expect(response).toEqual([
        { offenderNo: 'offenderNo1', bookingId: 1 },
        { offenderNo: 'offenderNo2', bookingId: 2 },
      ])
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      const securityContext = 'securityContextData'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getMovementsOut.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens.mockReturnValue(securityContext)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(securityContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getMovementsOut.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsOut' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getMovementsOut.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem.mockReturnValue(alertFlags)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(
        context,
        agency
      )
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })

  describe('In today', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getAssessments = jest.fn()
      incentivesApi.getIepSummaryForBookingIds = jest.fn()

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('Returns an empty array when there are no offenders in today', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn.mockReturnValue([])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toHaveLength(0)
    })

    it('Returns movements in', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
    })

    it('Decorates movements in with active alerts', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem.mockReturnValue([
        { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
        { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
      ])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toEqual([
        { offenderNo: 'G0000GG', alerts: [] },
        { offenderNo: 'G0001GG', alerts: ['XEL'] },
      ])
    })

    it('Decorates movements in with categories', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem.mockReturnValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getAssessments.mockReturnValue([
        { offenderNo: 'G0000GG', classificationCode: 'A' },
        { offenderNo: 'G0001GG', classificationCode: 'E' },
      ])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toEqual([
        { offenderNo: 'G0000GG', category: 'A', alerts: [] },
        { offenderNo: 'G0001GG', category: 'E', alerts: [] },
      ])
    })

    it('should request iep summary information ', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMovementsIn' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMovementsIn.mockReturnValue([
        { offenderNo: 'G0000GG', bookingId: 1 },
        { offenderNo: 'G0001GG', bookingId: 2 },
      ])
      incentivesApi.getIepSummaryForBookingIds.mockReturnValue([
        { bookingId: 1, iepLevel: 'basic' },
        { bookingId: 2, iepLevel: 'standard' },
      ])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )

      expect(response).toEqual([
        {
          bookingId: 1,
          offenderNo: 'G0000GG',
          iepLevel: 'basic',
        },
        {
          bookingId: 2,
          offenderNo: 'G0001GG',
          iepLevel: 'standard',
        },
      ])
    })
  })

  describe('In Reception', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getRecentMovements = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getAssessments = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens = jest.fn()
      incentivesApi.getIepSummaryForBookingIds = jest.fn()

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getRecentMovements.mockReturnValue([])
      incentivesApi.getIepSummaryForBookingIds.mockReturnValue([])
    })

    it('returns a empty array when there are no offenders in reception ', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(undefined)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(
        context,
        agency
      )

      expect(response).toEqual([])
    })

    it('should call recent movements for offenders in reception', async () => {
      const systemContext = { system: 'context' }
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(offenders)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens.mockReturnValue(systemContext)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getRecentMovements).toHaveBeenCalledWith(systemContext, offenderNumbers, [])
    })

    it('should populate offenders in reception with the from agency', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getRecentMovements.mockReturnValue([
        {
          offenderNo: offenders[0].offenderNo,
          fromAgencyDescription: 'Leeds',
          fromAgency: 'LEI',
        },
      ])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(
        context,
        agency
      )

      expect(response).toEqual([
        {
          ...offenders[0],
          ...recentMovementDefaults,
          fromAgencyDescription: 'Leeds',
          fromAgency: 'LEI',
        },
        {
          ...offenders[1],
        },
      ])
    })

    it('should request flags for the offenders in reception', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens.mockReturnValue({})

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(context, offenderNumbers)
    })

    it('should populate offenders in reception with alert flags', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem.mockReturnValue(alertFlags)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getRecentMovements.mockReturnValue([])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(
        context,
        agency
      )

      expect(response).toEqual([
        {
          ...offenders[0],
          alerts: ['HA', 'XEL'],
        },
        {
          ...offenders[1],
          alerts: [],
        },
      ])
    })

    it('should request iep summary information for offenders in reception', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersInReception' does not exist ... Remove this comment to see the full error message
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      incentivesApi.getIepSummaryForBookingIds.mockReturnValue([
        { ...offenders[0], iepLevel: 'basic' },
        { ...offenders[1], iepLevel: 'standard' },
      ])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(
        context,
        agency
      )

      expect(response).toEqual([
        { ...offenders[0], iepLevel: 'basic' },
        { ...offenders[1], iepLevel: 'standard' },
      ])
    })

    it('should not request extra information if there are no offenders in reception', async () => {
      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getAlertsSystem.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getRecentMovements.mock.calls.length).toBe(0)
      expect(incentivesApi.getIepSummaryForBookingIds.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getAssessments.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      expect(oauthClient.getClientCredentialsTokens.mock.calls.length).toBe(0)
    })
  })

  describe('Currently out', () => {
    describe('livingUnit', () => {
      const key = 123

      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getAssessments = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        oauthClient.getClientCredentialsTokens = jest.fn()

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({ currentlyOut: [], location: 'location' })
      })

      it('falls back to internalLocationCode for location', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({ internalLocationCode: 'internalLocationCode' })

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: 'internalLocationCode',
          currentlyOut: [{ offenderNo: 'G0000GG' }],
        })
      })

      it('falls back to blank location', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({})

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: '',
          currentlyOut: [{ offenderNo: 'G0000GG' }],
        })
      })

      it('Returns offenders currently out', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }],
        })
      })

      it('Decorates with active alerts', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem.mockReturnValue([
          { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
          { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [
            { offenderNo: 'G0000GG', alerts: [] },
            { offenderNo: 'G0001GG', alerts: ['XEL'] },
          ],
        })
      })

      it('Decorates with categories', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getAssessments.mockReturnValue([
          { offenderNo: 'G0000GG', classificationCode: 'A' },
          { offenderNo: 'G0001GG', classificationCode: 'E' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [
            { offenderNo: 'G0000GG', category: 'A', alerts: [] },
            { offenderNo: 'G0001GG', category: 'E', alerts: [] },
          ],
        })
      })

      it('Decorates with movements', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([
          {
            offenderNo: 'G0000GG',
            toAgency: 'To Agency',
            toAgencyDescription: 'To Agency Description',
            commentText: 'Comment text',
          },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [
            {
              offenderNo: 'G0000GG',
              toAgency: 'To Agency',
              toAgencyDescription: 'To Agency Description',
              commentText: 'Comment text',
            },
            { offenderNo: 'G0001GG' },
          ],
        })
      })

      it('should request iep summary information for offenders in reception', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfLivingUnit' do... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        incentivesApi.getIepSummaryForBookingIds.mockReturnValue([
          { bookingId: 1, iepLevel: 'basic' },
          { bookingId: 2, iepLevel: 'standard' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)

        expect(response).toEqual({
          location: 'location',
          currentlyOut: [
            {
              bookingId: 1,
              offenderNo: 'G0000GG',
              iepLevel: 'basic',
            },
            {
              bookingId: 2,
              offenderNo: 'G0001GG',
              iepLevel: 'standard',
            },
          ],
        })
      })
    })

    describe('agency', () => {
      const key = 'MDI'

      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getAssessments = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        oauthClient.getClientCredentialsTokens = jest.fn()

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([])
      })

      it('falls back to internalLocationCode for location', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({ internalLocationCode: 'internalLocationCode' })

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('falls back to blank location', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getLocation.mockReturnValue({})

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('Returns offenders currently out', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      })

      it('Decorates with active alerts', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem.mockReturnValue([
          { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
          { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([
          { offenderNo: 'G0000GG', alerts: [] },
          { offenderNo: 'G0001GG', alerts: ['XEL'] },
        ])
      })

      it('Decorates with categories', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAlertsSystem.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getAssessments.mockReturnValue([
          { offenderNo: 'G0000GG', classificationCode: 'A' },
          { offenderNo: 'G0001GG', classificationCode: 'E' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([
          { offenderNo: 'G0000GG', category: 'A', alerts: [] },
          { offenderNo: 'G0001GG', category: 'E', alerts: [] },
        ])
      })

      it('Decorates with movements', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRecentMovements' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getRecentMovements.mockReturnValue([
          {
            offenderNo: 'G0000GG',
            toAgency: 'To Agency',
            toAgencyDescription: 'To Agency Description',
            commentText: 'Comment text',
          },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([
          {
            offenderNo: 'G0000GG',
            toAgency: 'To Agency',
            toAgencyDescription: 'To Agency Description',
            commentText: 'Comment text',
          },
          { offenderNo: 'G0001GG' },
        ])
      })

      it('should request iep summary information for offenders in reception', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersCurrentlyOutOfAgency' does n... Remove this comment to see the full error message
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        incentivesApi.getIepSummaryForBookingIds.mockReturnValue([
          { bookingId: 1, iepLevel: 'basic' },
          { bookingId: 2, iepLevel: 'standard' },
        ])

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)

        expect(response).toEqual([
          {
            bookingId: 1,
            offenderNo: 'G0000GG',
            iepLevel: 'basic',
          },
          {
            bookingId: 2,
            offenderNo: 'G0001GG',
            iepLevel: 'standard',
          },
        ])
      })
    })
  })

  describe('En-route', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getAssessments = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
      prisonApi.getOffendersEnRoute = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('should make a request for offenders en-route to an establishment', async () => {
      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
      expect(prisonApi.getOffendersEnRoute).toHaveBeenCalledWith(context, agency)
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      const securityContext = 'securityContextData'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      oauthClient.getClientCredentialsTokens.mockReturnValue(securityContext)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(securityContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffendersEnRoute' does not exist on t... Remove this comment to see the full error message
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertsSystem' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getAlertsSystem.mockReturnValue(alertFlags)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(
        context,
        agency
      )
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })
})
