import { movementsServiceFactory } from '../services/movementsService'

describe('Movement service', () => {
  const prisonApi = {
    getMovementsIn: jest.fn(),
    getMovementsOut: jest.fn(),
    getOffendersInReception: jest.fn(),
    getOffendersCurrentlyOutOfLivingUnit: jest.fn(),
    getOffendersCurrentlyOutOfAgency: jest.fn(),
    getOffendersEnRoute: jest.fn(),
    getCsraAssessments: jest.fn(),
    getAlertsSystem: jest.fn(),
    getAssessments: jest.fn(),
    getRecentMovements: jest.fn(),
    getAttributesForLocation: jest.fn(),
    getLocation: jest.fn(),
  }
  const oauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  const incentivesApi = {
    getIepSummaryForBookingIds: jest.fn(),
  }
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
  const systemContext = { system: 'context' }
  // const securityContext = 'securityContextData'

  beforeEach(() => {
    jest.resetAllMocks()
    oauthClient.getClientCredentialsTokens.mockReturnValue(systemContext)
  })

  describe('Out today', () => {
    it('handles no offenders out today', async () => {
      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut({}, 'LEI')
      expect(response).toEqual([])
    })

    it('handles no assessments and no alerts', async () => {
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
      prisonApi.getMovementsOut.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(context, agency)

      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(systemContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      prisonApi.getMovementsOut.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsOut(context, agency)

      expect(prisonApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      prisonApi.getMovementsOut.mockReturnValue(offenders)
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
      incentivesApi.getIepSummaryForBookingIds = jest.fn()
    })

    it('Returns an empty array when there are no offenders in today', async () => {
      prisonApi.getMovementsIn.mockReturnValue([])

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toHaveLength(0)
    })

    it('Returns movements in', async () => {
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getMovementsIn(
        context,
        agency
      )
      expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
    })

    it('Decorates movements in with active alerts', async () => {
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
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
      prisonApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      prisonApi.getAlertsSystem.mockReturnValue([])
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
      prisonApi.getMovementsIn.mockReturnValue([
        { offenderNo: 'G0000GG', bookingId: 1 },
        { offenderNo: 'G0001GG', bookingId: 2 },
      ])
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([
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
      prisonApi.getRecentMovements.mockReturnValue([])
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([])
    })

    it('returns a empty array when there are no offenders in reception ', async () => {
      prisonApi.getOffendersInReception.mockReturnValue(undefined)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(
        context,
        agency
      )

      expect(response).toEqual([])
    })

    it('should call recent movements for offenders in reception', async () => {
      prisonApi.getOffendersInReception.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      expect(prisonApi.getRecentMovements).toHaveBeenCalledWith(systemContext, offenderNumbers, [])
    })

    it('should populate offenders in reception with the from agency', async () => {
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
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
      prisonApi.getOffendersInReception.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(systemContext, offenderNumbers)
    })

    it('should populate offenders in reception with alert flags', async () => {
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      prisonApi.getAlertsSystem.mockReturnValue(alertFlags)
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
      prisonApi.getOffendersInReception.mockReturnValue(offenders)
      incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([
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
      prisonApi.getOffendersInReception.mockReturnValue([])

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      expect(prisonApi.getAlertsSystem.mock.calls.length).toBe(0)
      expect(prisonApi.getRecentMovements.mock.calls.length).toBe(0)
      expect(incentivesApi.getIepSummaryForBookingIds.mock.calls.length).toBe(0)
      expect(prisonApi.getAssessments.mock.calls.length).toBe(0)
      expect(oauthClient.getClientCredentialsTokens.mock.calls.length).toBe(0)
    })

    it('should not request extra information if offenders in reception are undefined', async () => {
      prisonApi.getOffendersInReception.mockReturnValue(undefined)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersInReception(context, agency)

      expect(prisonApi.getAlertsSystem.mock.calls.length).toBe(0)
      expect(prisonApi.getRecentMovements.mock.calls.length).toBe(0)
      expect(incentivesApi.getIepSummaryForBookingIds.mock.calls.length).toBe(0)
      expect(prisonApi.getAssessments.mock.calls.length).toBe(0)
      expect(oauthClient.getClientCredentialsTokens.mock.calls.length).toBe(0)
    })
  })

  describe('Currently out', () => {
    describe('livingUnit', () => {
      const key = 123

      beforeEach(() => {
        prisonApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfLivingUnit(context, key)
        expect(response).toEqual({ currentlyOut: [], location: 'location' })
      })

      it('falls back to internalLocationCode for location', async () => {
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        prisonApi.getRecentMovements.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        prisonApi.getRecentMovements.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        prisonApi.getRecentMovements.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        prisonApi.getRecentMovements.mockReturnValue([])
        prisonApi.getAlertsSystem.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
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
        prisonApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([
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
        prisonApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([])
      })

      it('falls back to internalLocationCode for location', async () => {
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        prisonApi.getRecentMovements.mockReturnValue([])
        prisonApi.getLocation.mockReturnValue({ internalLocationCode: 'internalLocationCode' })

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('falls back to blank location', async () => {
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        prisonApi.getRecentMovements.mockReturnValue([])
        prisonApi.getLocation.mockReturnValue({})

        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('Returns offenders currently out', async () => {
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        prisonApi.getRecentMovements.mockReturnValue([])
        const response = await movementsServiceFactory(
          prisonApi,
          oauthClient,
          incentivesApi
        ).getOffendersCurrentlyOutOfAgency(context, key)
        expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      })

      it('Decorates with active alerts', async () => {
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        prisonApi.getRecentMovements.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        prisonApi.getRecentMovements.mockReturnValue([])
        prisonApi.getAlertsSystem.mockReturnValue([])
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
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
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
        prisonApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        incentivesApi.getIepSummaryForBookingIds.mockResolvedValue([
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
    it('should make a request for offenders en-route to an establishment', async () => {
      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      expect(prisonApi.getOffendersEnRoute).toHaveBeenCalledWith(systemContext, agency)
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      expect(prisonApi.getAlertsSystem).toHaveBeenCalledWith(systemContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)

      await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(context, agency)

      expect(prisonApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      prisonApi.getOffendersEnRoute.mockReturnValue(offenders)
      prisonApi.getAlertsSystem.mockReturnValue(alertFlags)

      const response = await movementsServiceFactory(prisonApi, oauthClient, incentivesApi).getOffendersEnRoute(
        context,
        agency
      )
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })
})
