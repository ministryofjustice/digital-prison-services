import { movementsServiceFactory } from '../services/movementsService'

describe('Movement service', () => {
  const eliteApi = {}
  const oauthClient = {}
  const context = {}
  const agency = 'LEI'
  const offenders = [{ offenderNo: 'offenderNo1', bookingId: 1 }, { offenderNo: 'offenderNo2', bookingId: 2 }]
  const offenderNumbers = offenders.map(offender => offender.offenderNo)
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
      eliteApi.getMovementsOut = jest.fn()
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('handles no offenders out today', async () => {
      const response = await movementsServiceFactory(eliteApi).getMovementsOut({}, 'LEI')
      expect(response).toEqual([])
    })

    it('handles no assessments and no alerts', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(response).toEqual([
        { offenderNo: 'offenderNo1', bookingId: 1 },
        { offenderNo: 'offenderNo2', bookingId: 2 },
      ])
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      const securityContext = 'securityContextData'

      eliteApi.getMovementsOut.mockReturnValue(offenders)
      oauthClient.getClientCredentialsTokens.mockReturnValue(securityContext)

      await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(eliteApi.getAlertsSystem).toHaveBeenCalledWith(securityContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)

      await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(eliteApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)
      eliteApi.getAlertsSystem.mockReturnValue(alertFlags)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })

  describe('In today', () => {
    beforeEach(() => {
      eliteApi.getMovementsIn = jest.fn()
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      eliteApi.getIepSummary = jest.fn()

      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('Returns an empty array when there are no offenders in today', async () => {
      eliteApi.getMovementsIn.mockReturnValue([])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toHaveLength(0)
    })

    it('Returns movements in', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
    })

    it('Decorates movements in with active alerts', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      eliteApi.getAlertsSystem.mockReturnValue([
        { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
        { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([{ offenderNo: 'G0000GG', alerts: [] }, { offenderNo: 'G0001GG', alerts: ['XEL'] }])
    })

    it('Decorates movements in with categories', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      eliteApi.getAlertsSystem.mockReturnValue([])
      eliteApi.getAssessments.mockReturnValue([
        { offenderNo: 'G0000GG', classificationCode: 'A' },
        { offenderNo: 'G0001GG', classificationCode: 'E' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([
        { offenderNo: 'G0000GG', category: 'A', alerts: [] },
        { offenderNo: 'G0001GG', category: 'E', alerts: [] },
      ])
    })

    it('should request iep summary information ', async () => {
      eliteApi.getMovementsIn.mockReturnValue([
        { offenderNo: 'G0000GG', bookingId: 1 },
        { offenderNo: 'G0001GG', bookingId: 2 },
      ])
      eliteApi.getIepSummary.mockReturnValue([
        { bookingId: 1, iepLevel: 'basic' },
        { bookingId: 2, iepLevel: 'standard' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)

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
      eliteApi.getRecentMovements = jest.fn()
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      eliteApi.getOffendersInReception = jest.fn()
      oauthClient.getClientCredentialsTokens = jest.fn()
      eliteApi.getIepSummary = jest.fn()

      eliteApi.getRecentMovements.mockReturnValue([])
      eliteApi.getIepSummary.mockReturnValue([])
    })

    it('returns a empty array when there are no offenders in reception ', async () => {
      eliteApi.getOffendersInReception.mockReturnValue(undefined)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

      expect(response).toEqual([])
    })

    it('should call recent movements for offenders in reception', async () => {
      const systemContext = { system: 'context' }
      eliteApi.getOffendersInReception.mockReturnValue(offenders)

      oauthClient.getClientCredentialsTokens.mockReturnValue(systemContext)

      await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

      expect(eliteApi.getRecentMovements).toHaveBeenCalledWith(systemContext, offenderNumbers, [])
    })

    it('should populate offenders in reception with the from agency', async () => {
      eliteApi.getOffendersInReception.mockReturnValue(offenders)
      eliteApi.getRecentMovements.mockReturnValue([
        {
          offenderNo: offenders[0].offenderNo,
          fromAgencyDescription: 'Leeds',
          fromAgency: 'LEI',
        },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

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
      eliteApi.getOffendersInReception.mockReturnValue(offenders)
      oauthClient.getClientCredentialsTokens.mockReturnValue({})

      await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

      expect(eliteApi.getAlertsSystem).toHaveBeenCalledWith(context, offenderNumbers)
    })

    it('should populate offenders in reception with alert flags', async () => {
      eliteApi.getOffendersInReception.mockReturnValue(offenders)
      eliteApi.getAlertsSystem.mockReturnValue(alertFlags)
      eliteApi.getRecentMovements.mockReturnValue([])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

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
      eliteApi.getOffendersInReception.mockReturnValue(offenders)
      eliteApi.getIepSummary.mockReturnValue([
        { ...offenders[0], iepLevel: 'basic' },
        { ...offenders[1], iepLevel: 'standard' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

      expect(response).toEqual([{ ...offenders[0], iepLevel: 'basic' }, { ...offenders[1], iepLevel: 'standard' }])
    })

    it('should not request extra information if there are no offenders in reception', async () => {
      await movementsServiceFactory(eliteApi, oauthClient).getOffendersInReception(context, agency)

      expect(eliteApi.getAlertsSystem.mock.calls.length).toBe(0)
      expect(eliteApi.getRecentMovements.mock.calls.length).toBe(0)
      expect(eliteApi.getIepSummary.mock.calls.length).toBe(0)
      expect(eliteApi.getAssessments.mock.calls.length).toBe(0)
      expect(oauthClient.getClientCredentialsTokens.mock.calls.length).toBe(0)
    })
  })

  describe('Currently out', () => {
    describe('livingUnit', () => {
      const key = 123

      beforeEach(() => {
        eliteApi.getAlertsSystem = jest.fn()
        eliteApi.getAssessments = jest.fn()
        eliteApi.getOffendersCurrentlyOutOfLivingUnit = jest.fn()
        eliteApi.getLocation = jest.fn()
        eliteApi.getRecentMovements = jest.fn()
        oauthClient.getClientCredentialsTokens = jest.fn()

        eliteApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([])
        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({ currentlyOut: [], location: 'location' })
      })

      it('falls back to internalLocationCode for location', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getLocation.mockReturnValue({ internalLocationCode: 'internalLocationCode' })

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({
          location: 'internalLocationCode',
          currentlyOut: [{ offenderNo: 'G0000GG' }],
        })
      })

      it('falls back to blank location', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([{ offenderNo: 'G0000GG' }])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getLocation.mockReturnValue({})

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({
          location: '',
          currentlyOut: [{ offenderNo: 'G0000GG' }],
        })
      })

      it('Returns offenders currently out', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }],
        })
      })

      it('Decorates with active alerts', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getAlertsSystem.mockReturnValue([
          { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
          { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [{ offenderNo: 'G0000GG', alerts: [] }, { offenderNo: 'G0001GG', alerts: ['XEL'] }],
        })
      })

      it('Decorates with categories', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getAlertsSystem.mockReturnValue([])
        eliteApi.getAssessments.mockReturnValue([
          { offenderNo: 'G0000GG', classificationCode: 'A' },
          { offenderNo: 'G0001GG', classificationCode: 'E' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
        expect(response).toEqual({
          location: 'location',
          currentlyOut: [
            { offenderNo: 'G0000GG', category: 'A', alerts: [] },
            { offenderNo: 'G0001GG', category: 'E', alerts: [] },
          ],
        })
      })

      it('Decorates with movements', async () => {
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([
          {
            offenderNo: 'G0000GG',
            toAgency: 'To Agency',
            toAgencyDescription: 'To Agency Description',
            commentText: 'Comment text',
          },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )
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
        eliteApi.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        eliteApi.getIepSummary.mockReturnValue([
          { bookingId: 1, iepLevel: 'basic' },
          { bookingId: 2, iepLevel: 'standard' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfLivingUnit(
          context,
          key
        )

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
        eliteApi.getAlertsSystem = jest.fn()
        eliteApi.getAssessments = jest.fn()
        eliteApi.getOffendersCurrentlyOutOfAgency = jest.fn()
        eliteApi.getLocation = jest.fn()
        eliteApi.getRecentMovements = jest.fn()
        oauthClient.getClientCredentialsTokens = jest.fn()

        eliteApi.getLocation.mockReturnValue({ userDescription: 'location' })
      })

      it('Returns an default result when there are no offenders currently out', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([])
        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([])
      })

      it('falls back to internalLocationCode for location', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getLocation.mockReturnValue({ internalLocationCode: 'internalLocationCode' })

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('falls back to blank location', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([{ offenderNo: 'G0000GG' }])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getLocation.mockReturnValue({})

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([{ offenderNo: 'G0000GG' }])
      })

      it('Returns offenders currently out', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      })

      it('Decorates with active alerts', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getAlertsSystem.mockReturnValue([
          { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
          { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([{ offenderNo: 'G0000GG', alerts: [] }, { offenderNo: 'G0001GG', alerts: ['XEL'] }])
      })

      it('Decorates with categories', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([])
        eliteApi.getAlertsSystem.mockReturnValue([])
        eliteApi.getAssessments.mockReturnValue([
          { offenderNo: 'G0000GG', classificationCode: 'A' },
          { offenderNo: 'G0001GG', classificationCode: 'E' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
        expect(response).toEqual([
          { offenderNo: 'G0000GG', category: 'A', alerts: [] },
          { offenderNo: 'G0001GG', category: 'E', alerts: [] },
        ])
      })

      it('Decorates with movements', async () => {
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG' },
          { offenderNo: 'G0001GG' },
        ])
        eliteApi.getRecentMovements.mockReturnValue([
          {
            offenderNo: 'G0000GG',
            toAgency: 'To Agency',
            toAgencyDescription: 'To Agency Description',
            commentText: 'Comment text',
          },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
        )
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
        eliteApi.getOffendersCurrentlyOutOfAgency.mockReturnValue([
          { offenderNo: 'G0000GG', bookingId: 1 },
          { offenderNo: 'G0001GG', bookingId: 2 },
        ])
        eliteApi.getIepSummary.mockReturnValue([
          { bookingId: 1, iepLevel: 'basic' },
          { bookingId: 2, iepLevel: 'standard' },
        ])

        const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersCurrentlyOutOfAgency(
          context,
          key
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
  })

  describe('En-route', () => {
    beforeEach(() => {
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      eliteApi.getOffendersEnRoute = jest.fn()
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('should make a request for offenders en-route to an establishment', async () => {
      await movementsServiceFactory(eliteApi, oauthClient).getOffendersEnRoute(context, agency)

      expect(eliteApi.getOffendersEnRoute).toHaveBeenCalledWith(context, agency)
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      const securityContext = 'securityContextData'

      eliteApi.getOffendersEnRoute.mockReturnValue(offenders)
      oauthClient.getClientCredentialsTokens.mockReturnValue(securityContext)

      await movementsServiceFactory(eliteApi, oauthClient).getOffendersEnRoute(context, agency)

      expect(eliteApi.getAlertsSystem).toHaveBeenCalledWith(securityContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      eliteApi.getOffendersEnRoute.mockReturnValue(offenders)

      await movementsServiceFactory(eliteApi, oauthClient).getOffendersEnRoute(context, agency)

      expect(eliteApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      eliteApi.getOffendersEnRoute.mockReturnValue(offenders)
      eliteApi.getAlertsSystem.mockReturnValue(alertFlags)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getOffendersEnRoute(context, agency)
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })
})
