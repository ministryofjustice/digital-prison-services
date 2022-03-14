import prisonerQuickLook from '../controllers/prisonerProfile/prisonerQuickLook'

describe('prisoner profile quick look', () => {
  const offenderNo = 'ABC123'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
    profileInformation: [{ type: 'NAT', resultValue: 'British' }],
  }
  const bookingId = '123'
  const prisonApi = {}
  const offenderSearchApi = {}
  const prisonerProfileService = {}
  const telemetry = {}
  const systemOauthClient = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      session: {
        userDetails: {
          username: 'user1',
        },
      },
    }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
      },
      render: jest.fn(),
      status: jest.fn(),
    }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getMainOffence = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerBalances' does not exist on t... Remove this comment to see the full error message
    prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
    prisonApi.getIepSummaryForBooking = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
    prisonApi.getPositiveCaseNotes = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
    prisonApi.getNegativeCaseNotes = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
    prisonApi.getAdjudicationsForBooking = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsSummary' does not exist on type '{}... Remove this comment to see the full error message
    prisonApi.getVisitsSummary = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerVisitBalances' does not exist... Remove this comment to see the full error message
    prisonApi.getPrisonerVisitBalances = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEventsForToday' does not exist on typ... Remove this comment to see the full error message
    prisonApi.getEventsForToday = jest.fn().mockResolvedValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'trackEvent' does not exist on type '{}'.
    telemetry.trackEvent = jest.fn().mockResolvedValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
    offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockReturnValue({})

    controller = prisonerQuickLook({
      prisonerProfileService,
      prisonApi,
      telemetry,
      offenderSearchApi,
      systemOauthClient,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: {}; pr... Remove this comment to see the full error message
      logError,
    })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo, 'user1')
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  it('should send custom event with username and active caseload', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'trackEvent' does not exist on type '{}'.
    expect(telemetry.trackEvent).toHaveBeenCalledWith({
      name: 'ViewPrisonerProfile',
      properties: { username: 'user1', caseLoadId: 'MDI' },
    })
  })

  describe('offence data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for offence data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getMainOffence).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing offence data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence',
                value: 'Not entered',
              },
              {
                label: 'Imprisonment status',
                value: 'Not entered',
              },
              {
                label: 'Release date',
                value: 'Not entered',
              },
            ],
          })
        )
      })
    })

    describe('when there is offence data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getMainOffence.mockResolvedValue([
          { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
      })

      it('should render the quick look template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence',
                value: 'Have blade/article which was sharply pointed in public place',
              },
              {
                label: 'Imprisonment status',
                value: 'Adult Imprisonment Without Option CJA03',
              },
              {
                label: 'Release date',
                value: '13 December 2020',
              },
            ],
          })
        )
      })

      it('should not call prisoner-search-service if there is a release date', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2099-12-12' } })

        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        expect(systemOauthClient.getClientCredentialsTokens).not.toHaveBeenCalled()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
        expect(offenderSearchApi.getPrisonersDetails).not.toHaveBeenCalled()
      })

      it('should show Life Imprisonment alongside the release date if no release date is set and the offender has a life term', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '' } })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
        offenderSearchApi.getPrisonersDetails.mockResolvedValue([{ indeterminateSentence: true }])

        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence',
                value: 'Have blade/article which was sharply pointed in public place',
              },
              {
                label: 'Imprisonment status',
                value: 'Serving Life Imprisonment',
              },
              {
                label: 'Release date',
                value: 'Life sentence',
              },
            ],
          })
        )
      })

      it('should show Not entered alongside the release date if no release date is set and the offender is not on a life term', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '' } })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
        offenderSearchApi.getPrisonersDetails.mockResolvedValue([{ indeterminateSentence: false }])

        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence',
                value: 'Have blade/article which was sharply pointed in public place',
              },
              {
                label: 'Imprisonment status',
                value: 'Serving Life Imprisonment',
              },
              {
                label: 'Release date',
                value: 'Not entered',
              },
            ],
          })
        )
      })
    })
  })

  describe('balance data', () => {
    describe('when there is missing balance data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              {
                label: 'Spends',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/spends" class="govuk-link">£0.00</a>',
                visible: true,
              },
              {
                label: 'Private cash',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/private-cash" class="govuk-link">£0.00</a>',
                visible: true,
              },
              {
                label: 'Savings',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/savings" class="govuk-link">£0.00</a>',
                visible: true,
              },
              {
                label: 'Damage obligations',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/damage-obligations" class="govuk-link">£0.00</a>',
                visible: false,
              },
            ],
          })
        )
      })
    })

    describe('when there is balance data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerBalances' does not exist on t... Remove this comment to see the full error message
        prisonApi.getPrisonerBalances.mockResolvedValue({
          spends: 100,
          cash: 75.5,
          savings: 50,
          damageObligations: 65,
          currency: 'GBP',
        })
      })

      it('should render the quick look template with the correctly formatted balance/money data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              {
                label: 'Spends',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/spends" class="govuk-link">£100.00</a>',
                visible: true,
              },
              {
                label: 'Private cash',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/private-cash" class="govuk-link">£75.50</a>',
                visible: true,
              },
              {
                label: 'Savings',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/savings" class="govuk-link">£50.00</a>',
                visible: true,
              },
              {
                label: 'Damage obligations',
                html: '<a href="/prisoner/ABC123/prisoner-finance-details/damage-obligations" class="govuk-link">£65.00</a>',
                visible: true,
              },
            ],
          })
        )
      })
    })
  })

  describe('personal data', () => {
    describe('when there is missing personal data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: undefined },
              { label: 'Nationality', value: 'British' },
              { label: 'PNC number', value: 'Not entered' },
              { label: 'CRO number', value: 'Not entered' },
            ],
          })
        )
      })
    })

    describe('when there is personal data', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1578873601000) // 2020-01-13T00:00:01.000Z
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { dateOfBirth: '1998-12-01', pncNumber: '12/3456A', croNumber: '12345/57B' },
        ])
      })

      it('should render the quick look template with the correctly formatted personal details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: 21 },
              { label: 'Nationality', value: 'British' },
              { label: 'PNC number', value: '12/3456A' },
              { label: 'CRO number', value: '12345/57B' },
            ],
          })
        )
      })
    })
  })

  describe('case note and adjudications data', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1578873601000) // 2020-01-13T00:00:01.000Z
    })

    it('should make a request for the correct data', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })

      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      expect(prisonApi.getIepSummaryForBooking).toHaveBeenCalledWith(
        {
          user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        },
        bookingId,
        false
      )
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      expect(prisonApi.getPositiveCaseNotes).toHaveBeenCalledWith(
        {
          user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        },
        bookingId,
        '2019-10-13',
        '2020-01-13'
      )
    })

    describe('when there is missing case note and adjudications data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            adjudications: {
              adjudicationsSectionError: false,
              active: { label: 'Active adjudications', value: undefined },
              proven: { label: 'Proven adjudications', value: 0 },
            },
            incentives: {
              incentivesSectionError: false,
              details: [
                { label: 'Incentive level warnings', value: 0 },
                { label: 'Incentive encouragements', value: 0 },
                { label: 'Last incentive level review', value: '0 days ago' },
              ],
            },
          })
        )
      })
    })

    describe('when there is case note and adjudications data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
        prisonApi.getIepSummaryForBooking.mockResolvedValue({ daysSinceReview: 40 })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
        prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 2 })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
        prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 1 })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
        prisonApi.getAdjudicationsForBooking.mockResolvedValue({
          adjudicationCount: 3,
          awards: [
            {
              sanctionCode: 'STOP_PCT',
              sanctionCodeDescription: 'Stoppage of Earnings (%)',
              days: 14,
              limit: 50,
              effectiveDate: '2020-04-16',
              status: 'IMMEDIATE',
              statusDescription: 'Immediate',
            },
            {
              sanctionCode: 'STOP_EARN',
              sanctionCodeDescription: 'Stoppage of Earnings (amount)',
              days: 14,
              limit: 50,
              comment: '14x SOE 50%, 14x LOC, 14x LOA 14x LOGYM, 14x LOTV 14x CC',
              effectiveDate: '2020-04-16',
              status: 'IMMEDIATE',
              statusDescription: 'Immediate',
            },
            {
              sanctionCode: 'CC',
              sanctionCodeDescription: 'Cellular Confinement',
              days: 14,
              effectiveDate: '2020-04-16',
              status: 'SUSP',
              statusDescription: 'Suspended',
            },
            {
              sanctionCode: 'FORFEIT',
              sanctionCodeDescription: 'Forfeiture of Privileges',
              days: 7,
              comment: '7x LOC, 7x LOA, 7x LOTV',
              effectiveDate: '2020-04-16',
              status: 'QUASHED',
              statusDescription: 'Quashed',
            },
          ],
        })
      })

      it('should render the quick look template with the correctly formatted case note and adjudication details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            adjudications: {
              adjudicationsSectionError: false,
              active: {
                label: 'Active adjudications',
                value: [
                  {
                    days: 14,
                    durationText: '14 days',
                    effectiveDate: '16/04/2020',
                    limit: 50,
                    sanctionCode: 'STOP_PCT',
                    sanctionCodeDescription: 'Stoppage of Earnings (50%)',
                    status: 'IMMEDIATE',
                    statusDescription: 'Immediate',
                  },
                  {
                    comment: '14x SOE 50%, 14x LOC, 14x LOA 14x LOGYM, 14x LOTV 14x CC',
                    days: 14,
                    durationText: '14 days',
                    effectiveDate: '16/04/2020',
                    limit: 50,
                    sanctionCode: 'STOP_EARN',
                    sanctionCodeDescription: 'Stoppage of Earnings (£50.00)',
                    status: 'IMMEDIATE',
                    statusDescription: 'Immediate',
                  },
                ],
              },
              proven: { label: 'Proven adjudications', value: 3 },
            },
            incentives: {
              incentivesSectionError: false,
              details: [
                { label: 'Incentive level warnings', value: 1 },
                { label: 'Incentive encouragements', value: 2 },
                { label: 'Last incentive level review', value: '40 days ago' },
              ],
            },
          })
        )
      })
    })

    describe('visit data', () => {
      describe('when there is missing visit data', () => {
        it('should still render the quick look template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
            expect.objectContaining({
              visits: {
                details: [
                  { label: 'Remaining visits', value: 'Not entered' },
                  { label: 'Remaining privileged visits', value: 'Not entered' },
                  { label: 'Next visit date', value: 'None scheduled' },
                ],
                visitSectionError: false,
                displayLink: false,
              },
            })
          )
        })
      })

      describe('when there is visit data', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsSummary' does not exist on type '{}... Remove this comment to see the full error message
          prisonApi.getVisitsSummary.mockResolvedValue({
            startDateTime: '2020-04-17T13:30:00',
            hasVisits: true,
          })
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerVisitBalances' does not exist... Remove this comment to see the full error message
          prisonApi.getPrisonerVisitBalances.mockResolvedValue({ remainingVo: 0, remainingPvo: 0 })
        })

        it('should render the quick look template with the correctly formatted visits details', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
            expect.objectContaining({
              visits: {
                visitSectionError: false,
                details: [
                  { label: 'Remaining visits', value: 0 },
                  { label: 'Remaining privileged visits', value: 0 },
                  { label: 'Next visit date', value: '17 April 2020' },
                ],
                displayLink: true,
              },
            })
          )
        })
      })
    })

    describe('scheduled activity data', () => {
      describe('when there is missing scheduled activity data', () => {
        it('should still render the quick look template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
            expect.objectContaining({
              scheduledActivityPeriods: [
                { label: 'Morning', value: [] },
                { label: 'Afternoon', value: [] },
                { label: 'Evening', value: [] },
              ],
            })
          )
        })
      })
    })

    describe('when there is visit data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEventsForToday' does not exist on typ... Remove this comment to see the full error message
        prisonApi.getEventsForToday.mockResolvedValue([
          {
            bookingId,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'EDUC',
            eventSubTypeDesc: 'Education',
            eventDate: '2020-04-17',
            startTime: '2020-04-17T09:00:00',
            endTime: '2020-04-17T10:00:00',
            eventLocation: 'BADMINTON',
            eventSource: 'APP',
            eventSourceCode: 'APP',
          },
          {
            bookingId,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'CABE',
            eventSubTypeDesc: 'Case - Benefits',
            eventDate: '2020-04-17',
            startTime: '2020-04-17T13:00:00',
            endTime: '2020-04-17T14:00:00',
            eventLocation: 'CIRCUIT',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Test Comment',
          },
          {
            bookingId,
            eventClass: 'INT_MOV',
            eventStatus: 'CANC',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'GYMSH',
            eventSubTypeDesc: 'Gym - Sports Halls Activity',
            eventDate: '2020-04-17',
            startTime: '2020-04-17T15:00:00',
            endTime: '2020-04-17T15:30:00',
            eventLocation: 'BASKETBALL',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Test comment',
          },
          {
            bookingId,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'GYMF',
            eventSubTypeDesc: 'Gym - Football',
            eventDate: '2020-04-17',
            startTime: '2020-04-17T20:20:00',
            endTime: '2020-04-17T20:35:00',
            eventLocation: 'BADMINTON',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Testing a really long comment which is over 40 characters',
          },
        ])
      })

      it('should render the quick look template with the correctly formatted activities in the correct periods', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            scheduledActivityPeriods: [
              {
                label: 'Morning',
                value: [
                  {
                    cancelled: false,
                    comment: undefined,
                    endTime: '2020-04-17T10:00:00',
                    eventStatus: 'SCH',
                    shortComment: undefined,
                    startTime: '2020-04-17T09:00:00',
                    type: 'Education',
                  },
                ],
              },
              {
                label: 'Afternoon',
                value: [
                  {
                    cancelled: false,
                    comment: 'Test Comment',
                    endTime: '2020-04-17T14:00:00',
                    eventStatus: 'SCH',
                    shortComment: 'Test Comment',
                    startTime: '2020-04-17T13:00:00',
                    type: 'Case - Benefits',
                  },
                  {
                    cancelled: true,
                    comment: 'Test comment',
                    endTime: '2020-04-17T15:30:00',
                    eventStatus: 'CANC',
                    shortComment: 'Test comment',
                    startTime: '2020-04-17T15:00:00',
                    type: 'Gym - Sports Halls Activity',
                  },
                ],
              },
              {
                label: 'Evening',
                value: [
                  {
                    cancelled: false,
                    comment: 'Testing a really long comment which is over 40 characters',
                    endTime: '2020-04-17T20:35:00',
                    eventStatus: 'SCH',
                    shortComment: 'Testing a really long comment which is o...',
                    startTime: '2020-04-17T20:20:00',
                    type: 'Gym - Football',
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('when there are errors with getDetails', () => {
    const error = new Error('Network error')

    beforeEach(() => {
      req.params.offenderNo = offenderNo
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockRejectedValue(error)
    })

    it('should render the error template', async () => {
      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })

  describe('when there are errors with retrieving information', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
      prisonerProfileService.getPrisonerProfileData = jest.fn().mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMainOffence.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerBalances' does not exist on t... Remove this comment to see the full error message
      prisonApi.getPrisonerBalances.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getPrisonerDetails.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
      prisonApi.getPrisonerSentenceDetails.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      prisonApi.getIepSummaryForBooking.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPositiveCaseNotes.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
      prisonApi.getAdjudicationsForBooking.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsSummary' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getVisitsSummary.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerVisitBalances' does not exist... Remove this comment to see the full error message
      prisonApi.getPrisonerVisitBalances.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEventsForToday' does not exist on typ... Remove this comment to see the full error message
      prisonApi.getEventsForToday.mockRejectedValue(new Error('Network error'))
    })

    it('should handle api errors when requesting main offence', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
      prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getPrisonerDetails.mockResolvedValue([
        { imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03' },
      ])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            { label: 'Main offence', value: 'Unable to show this detail' },
            { label: 'Imprisonment status', value: 'Adult Imprisonment Without Option CJA03' },
            { label: 'Release date', value: '13 December 2020' },
          ],
          offenceDetailsSectionError: false,
        })
      )
    })

    it('should handle api errors when requesting imprisonment status', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
      prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMainOffence.mockResolvedValue([
        { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            { label: 'Main offence', value: 'Have blade/article which was sharply pointed in public place' },
            { label: 'Imprisonment status', value: 'Unable to show this detail' },
            { label: 'Release date', value: '13 December 2020' },
          ],
          offenceDetailsSectionError: false,
        })
      )
    })
    it('should handle api errors when requesting imprisonment status and release date is not set', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
      prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '' } })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMainOffence.mockResolvedValue([
        { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonersDetails' does not exist on t... Remove this comment to see the full error message
      offenderSearchApi.getPrisonersDetails.mockRejectedValue(error)

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            { label: 'Main offence', value: 'Have blade/article which was sharply pointed in public place' },
            { label: 'Imprisonment status', value: 'Unable to show this detail' },
            { label: 'Release date', value: 'Unable to show this detail' },
          ],
          offenceDetailsSectionError: false,
        })
      )
    })

    it('should handle api error when requesting the release date', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMainOffence.mockResolvedValue([
        { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getPrisonerDetails.mockResolvedValue([
        {
          imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03',
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            { label: 'Main offence', value: 'Have blade/article which was sharply pointed in public place' },
            { label: 'Imprisonment status', value: 'Adult Imprisonment Without Option CJA03' },
            { label: 'Release date', value: 'Unable to show this detail' },
          ],
          offenceDetailsSectionError: false,
        })
      )
    })

    it('should handle api errors for all data required for the offences section', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetailsSectionError: true,
        })
      )
    })

    it('should handle api errors when requesting spends', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          balanceDetailsSectionError: true,
        })
      )
    })

    it('should handle api errors when requesting incentive level warnings', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      prisonApi.getIepSummaryForBooking.mockResolvedValue({ daysSinceReview: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
      prisonApi.getAdjudicationsForBooking.mockResolvedValue({
        adjudicationCount: 2,
        awards: [
          {
            sanctionCode: 'STOP_PCT',
            sanctionCodeDescription: 'Stoppage of Earnings (%)',
            days: 14,
            limit: 50,
            effectiveDate: '2020-04-16',
            status: 'IMMEDIATE',
            statusDescription: 'Immediate',
          },
        ],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: false,
            active: {
              label: 'Active adjudications',
              value: [
                {
                  days: 14,
                  durationText: '14 days',
                  effectiveDate: '16/04/2020',
                  limit: 50,
                  sanctionCode: 'STOP_PCT',
                  sanctionCodeDescription: 'Stoppage of Earnings (50%)',
                  status: 'IMMEDIATE',
                  statusDescription: 'Immediate',
                },
              ],
            },
            proven: { label: 'Proven adjudications', value: 2 },
          },
          incentives: {
            incentivesSectionError: false,
            details: [
              { label: 'Incentive level warnings', value: 'Unable to show this detail' },
              { label: 'Incentive encouragements', value: 10 },
              { label: 'Last incentive level review', value: '10 days ago' },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting incentive encouragements', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      prisonApi.getIepSummaryForBooking.mockResolvedValue({ daysSinceReview: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
      prisonApi.getAdjudicationsForBooking.mockResolvedValue({
        adjudicationCount: 2,
        awards: [
          {
            sanctionCode: 'STOP_PCT',
            sanctionCodeDescription: 'Stoppage of Earnings (%)',
            days: 14,
            limit: 50,
            effectiveDate: '2020-04-16',
            status: 'IMMEDIATE',
            statusDescription: 'Immediate',
          },
        ],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: false,
            active: {
              label: 'Active adjudications',
              value: [
                {
                  days: 14,
                  durationText: '14 days',
                  effectiveDate: '16/04/2020',
                  limit: 50,
                  sanctionCode: 'STOP_PCT',
                  sanctionCodeDescription: 'Stoppage of Earnings (50%)',
                  status: 'IMMEDIATE',
                  statusDescription: 'Immediate',
                },
              ],
            },
            proven: { label: 'Proven adjudications', value: 2 },
          },
          incentives: {
            incentivesSectionError: false,
            details: [
              { label: 'Incentive level warnings', value: 10 },
              { label: 'Incentive encouragements', value: 'Unable to show this detail' },
              { label: 'Last incentive level review', value: '10 days ago' },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting last incentive level review', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
      prisonApi.getAdjudicationsForBooking.mockResolvedValue({
        adjudicationCount: 2,
        awards: [
          {
            sanctionCode: 'STOP_PCT',
            sanctionCodeDescription: 'Stoppage of Earnings (%)',
            days: 14,
            limit: 50,
            effectiveDate: '2020-04-16',
            status: 'IMMEDIATE',
            statusDescription: 'Immediate',
          },
        ],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: false,
            active: {
              label: 'Active adjudications',
              value: [
                {
                  days: 14,
                  durationText: '14 days',
                  effectiveDate: '16/04/2020',
                  limit: 50,
                  sanctionCode: 'STOP_PCT',
                  sanctionCodeDescription: 'Stoppage of Earnings (50%)',
                  status: 'IMMEDIATE',
                  statusDescription: 'Immediate',
                },
              ],
            },
            proven: { label: 'Proven adjudications', value: 2 },
          },
          incentives: {
            incentivesSectionError: false,
            details: [
              { label: 'Incentive level warnings', value: 10 },
              { label: 'Incentive encouragements', value: 10 },
              { label: 'Last incentive level review', value: 'Unable to show this detail' },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting adjudications', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      prisonApi.getIepSummaryForBooking.mockResolvedValue({ daysSinceReview: 10 })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: true,
            active: { label: 'Active adjudications' },
            proven: { label: 'Proven adjudications', value: 'Unable to show this detail' },
          },
          incentives: {
            incentivesSectionError: false,
            details: [
              { label: 'Incentive level warnings', value: 10 },
              { label: 'Incentive encouragements', value: 10 },
              { label: 'Last incentive level review', value: '10 days ago' },
            ],
          },
        })
      )
    })

    it('should handle api errors for all data required for the adjudications section', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: true,
            active: {
              label: 'Active adjudications',
            },
            proven: { label: 'Proven adjudications', value: 'Unable to show this detail' },
          },
          incentives: {
            incentivesSectionError: true,
            details: [
              {
                label: 'Incentive level warnings',
                value: 'Unable to show this detail',
              },
              {
                label: 'Incentive encouragements',
                value: 'Unable to show this detail',
              },
              {
                label: 'Last incentive level review',
                value: 'Unable to show this detail',
              },
            ],
          },
          offenceDetails: [
            {
              label: 'Main offence',
              value: 'Unable to show this detail',
            },
            { label: 'Imprisonment status', value: 'Unable to show this detail' },
            {
              label: 'Release date',
              value: 'Unable to show this detail',
            },
          ],
        })
      )
    })

    it('should handle errors when requesting prisoner data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          personalDetails: [
            {
              label: 'Age',
              value: 'Unable to show this detail',
            },
            { label: 'Nationality', value: 'Unable to show this detail' },
            { label: 'PNC number', value: 'Unable to show this detail' },
            { label: 'CRO number', value: 'Unable to show this detail' },
          ],
        })
      )
    })

    it('should handle errors when requesting profile data', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1578873601000) // 2020-01-13T00:00:01.000Z
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getPrisonerDetails.mockResolvedValue([
        { dateOfBirth: '1998-12-01', pncNumber: '12/3456A', croNumber: '12345/57B' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          personalDetails: [
            {
              label: 'Age',
              value: 21,
            },
            { label: 'Nationality', value: 'Unable to show this detail' },
            { label: 'PNC number', value: '12/3456A' },
            { label: 'CRO number', value: '12345/57B' },
          ],
        })
      )
    })

    it('should handle api errors for all data required for the personal details section', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          personalDetailsSectionError: true,
        })
      )
    })

    it('should handle api errors when requesting visit balances', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsSummary' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getVisitsSummary.mockResolvedValue({
        startDateTime: '2020-04-17T13:30:00',
        hasVisits: true,
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          visits: {
            visitSectionError: false,
            details: [
              { label: 'Remaining visits', value: 'Unable to show this detail' },
              { label: 'Remaining privileged visits', value: 'Unable to show this detail' },
              { label: 'Next visit date', value: '17 April 2020' },
            ],
            displayLink: true,
          },
        })
      )
    })

    it('should handle api errors when requesting next visit', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerVisitBalances' does not exist... Remove this comment to see the full error message
      prisonApi.getPrisonerVisitBalances.mockResolvedValue({
        remainingVo: 20,
        remainingPvo: 10,
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          visits: {
            visitSectionError: false,
            details: [
              { label: 'Remaining visits', value: 20 },
              { label: 'Remaining privileged visits', value: 10 },
              { label: 'Next visit date', value: 'Unable to show this detail' },
            ],
            displayLink: false,
          },
        })
      )
    })

    it('should handle api errors for all data required for the personal visits section', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          visits: {
            details: [
              { label: 'Remaining visits', value: 'Unable to show this detail' },
              { label: 'Remaining privileged visits', value: 'Unable to show this detail' },
              { label: 'Next visit date', value: 'Unable to show this detail' },
            ],
            visitSectionError: true,
            displayLink: false,
          },
        })
      )
    })

    it('should handle api errors for all data required for the schedules section', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          scheduledActivityPeriodsSectionError: true,
        })
      )
    })

    it('should load schedules without section error', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEventsForToday' does not exist on typ... Remove this comment to see the full error message
      prisonApi.getEventsForToday.mockResolvedValue([
        {
          bookingId,
          eventClass: 'INT_MOV',
          eventStatus: 'SCH',
          eventType: 'APP',
          eventTypeDesc: 'Appointment',
          eventSubType: 'EDUC',
          eventSubTypeDesc: 'Education',
          eventDate: '2020-04-17',
          startTime: '2020-04-17T09:00:00',
          endTime: '2020-04-17T10:00:00',
          eventLocation: 'BADMINTON',
          eventSource: 'APP',
          eventSourceCode: 'APP',
        },
        {
          bookingId,
          eventClass: 'INT_MOV',
          eventStatus: 'CANC',
          eventType: 'APP',
          eventTypeDesc: 'Appointment',
          eventSubType: 'GYMSH',
          eventSubTypeDesc: 'Gym - Sports Halls Activity',
          eventDate: '2020-04-17',
          startTime: '2020-04-17T15:00:00',
          endTime: '2020-04-17T15:30:00',
          eventLocation: 'BASKETBALL',
          eventSource: 'APP',
          eventSourceCode: 'APP',
          eventSourceDesc: 'Test comment',
        },
        {
          bookingId,
          eventClass: 'INT_MOV',
          eventStatus: 'SCH',
          eventType: 'APP',
          eventTypeDesc: 'Appointment',
          eventSubType: 'GYMF',
          eventSubTypeDesc: 'Gym - Football',
          eventDate: '2020-04-17',
          startTime: '2020-04-17T20:20:00',
          endTime: '2020-04-17T20:35:00',
          eventLocation: 'BADMINTON',
          eventSource: 'APP',
          eventSourceCode: 'APP',
          eventSourceDesc: 'Testing a really long comment which is over 40 characters',
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          scheduledActivityPeriodsSectionError: false,
        })
      )
    })
  })

  describe('When data is missing', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getMainOffence' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getMainOffence = jest.fn().mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerBalances' does not exist on t... Remove this comment to see the full error message
      prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetails' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerSentenceDetails' does not exi... Remove this comment to see the full error message
      prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
      prisonApi.getIepSummaryForBooking = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPositiveCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPositiveCaseNotes = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationsForBooking' does not exi... Remove this comment to see the full error message
      prisonApi.getAdjudicationsForBooking = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsSummary' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getVisitsSummary = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerVisitBalances' does not exist... Remove this comment to see the full error message
      prisonApi.getPrisonerVisitBalances = jest.fn().mockResolvedValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEventsForToday' does not exist on typ... Remove this comment to see the full error message
      prisonApi.getEventsForToday = jest.fn().mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getProfileInformation' does not exist on... Remove this comment to see the full error message
      prisonApi.getProfileInformation = jest.fn().mockResolvedValue([])
    })

    it('should display correct defaults for offences', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          offenceDetails: [
            { label: 'Main offence', value: 'Not entered' },
            { label: 'Imprisonment status', value: 'Not entered' },
            { label: 'Release date', value: 'Not entered' },
          ],
        })
      )
    })

    it('should display correct defaults for case note adjudications for 1 warning', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNegativeCaseNotes' does not exist on ... Remove this comment to see the full error message
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 1 })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          adjudications: {
            adjudicationsSectionError: false,
            active: { label: 'Active adjudications', value: undefined },
            proven: { label: 'Proven adjudications', value: 0 },
          },
          incentives: {
            incentivesSectionError: false,
            details: [
              { label: 'Incentive level warnings', value: 1 },
              { label: 'Incentive encouragements', value: 0 },
              { label: 'Last incentive level review', value: '0 days ago' },
            ],
          },
        })
      )
    })

    it('should display correct default personal details', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
      prisonerProfileService.getPrisonerProfileData = jest
        .fn()
        .mockResolvedValue({ ...prisonerProfileData, profileInformation: [] })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          personalDetails: [
            { label: 'Age', value: undefined },
            { label: 'Nationality', value: 'Not entered' },
            { label: 'PNC number', value: 'Not entered' },
            { label: 'CRO number', value: 'Not entered' },
          ],
        })
      )
    })

    it('should pass nulls to frontend', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
      prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
        ...prisonerProfileData,
        keyWorkerName: null,
        keyWorkerLastSession: null,
        category: null,
        csra: null,
        profileInformation: [],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
        expect.objectContaining({
          prisonerProfileData: {
            activeAlertCount: 1,
            agencyName: 'Moorland Closed',
            alerts: [],
            category: null,
            csra: null,
            inactiveAlertCount: 2,
            incentiveLevel: 'Standard',
            keyWorkerLastSession: null,
            keyWorkerName: null,
            location: 'CELL-123',
            offenderName: 'Prisoner, Test',
            offenderNo: 'ABC123',
            profileInformation: [],
          },
        })
      )
    })
  })
})
