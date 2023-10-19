import { PrisonerNonAssociations } from '../api/nonAssociationsApi'
import type apis from '../apis'
import config from '../config'
import prisonerQuickLook from '../controllers/prisonerProfile/prisonerQuickLook'

describe('prisoner profile quick look', () => {
  const offenderNo = 'ABC123'
  const systemContext = {}
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
    showFinanceDetailLinks: true,
    indeterminateSentence: false,
  }
  const bookingId = 123
  const iepSummaryForBooking = {
    bookingId,
    iepDate: '2017-08-15',
    iepTime: '2017-08-15T16:04:35',
    iepLevel: 'Standard',
    daysSinceReview: 881,
    nextReviewDate: '2018-08-15',
    iepDetails: [],
  }
  const prisonApi = {
    getDetails: jest.fn(),
    getMainOffence: jest.fn(),
    getPrisonerBalances: jest.fn(),
    getPrisonerDetails: jest.fn(),
    getPrisonerSentenceDetails: jest.fn(),
    getPositiveCaseNotes: jest.fn(),
    getNegativeCaseNotes: jest.fn(),
    getPrisonerVisitBalances: jest.fn(),
    getVisitsSummary: jest.fn(),
    getEventsForToday: jest.fn(),
    getProfileInformation: jest.fn(),
  }
  const prisonerSearchDetails = { hospital: 'MDI', isRestrictedPatient: false, indeterminateSentence: false }
  const offenderSearchApi = {
    getPrisonersDetails: jest.fn().mockResolvedValue([]),
    getPrisonerDpsDetails: jest.fn().mockResolvedValue(prisonerSearchDetails),
  }
  const prisonerProfileService = {
    getPrisonerProfileData: jest.fn(),
  }
  const telemetry = {
    trackEvent: jest.fn(),
  }
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>
  const adjudicationsApi = {
    getAdjudicationsForBooking: jest.fn(),
  }
  const nonAssociationsApi = {} as jest.Mocked<typeof apis.nonAssociationsApi>

  const prisonerNonAssociations: PrisonerNonAssociations = {
    prisonerNumber: offenderNo,
    firstName: 'Test',
    lastName: 'Prisoner',
    prisonId: 'MDI',
    prisonName: 'HMP Moorland',
    cellLocation: prisonerProfileData.location,
    openCount: 1,
    closedCount: 0,
    nonAssociations: [
      {
        id: 42,
        role: 'VICTIM',
        roleDescription: 'Victim',
        reason: 'BULLYING',
        reasonDescription: 'Bullying',
        restrictionType: 'LANDING',
        restrictionTypeDescription: 'Cell and landing',
        comment: 'John was bullying Test',
        authorisedBy: 'USER_1',
        whenCreated: '2021-07-05T10:35:17',
        whenUpdated: '2021-07-05T10:35:17',
        updatedBy: 'USER_1',
        isClosed: false,
        closedBy: null,
        closedAt: null,
        closedReason: null,
        otherPrisonerDetails: {
          prisonerNumber: 'A0000AA',
          role: 'PERPETRATOR',
          roleDescription: 'Perpetrator',
          firstName: 'John',
          lastName: 'Doe',
          prisonId: 'MDI',
          prisonName: 'HMP Moorland',
          cellLocation: 'Z-122',
        },
      },
    ],
  }

  const oauthApi = {
    userRoles: jest.fn(),
  }

  let req
  let res
  let controller

  const nonAssociationsUrl = 'https://localhost/non-associations-ui'

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

    config.apis.nonAssociations.ui_url = nonAssociationsUrl

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    prisonApi.getDetails = jest.fn().mockResolvedValue({})
    prisonApi.getMainOffence = jest.fn().mockResolvedValue([])
    prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})
    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([])
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({})
    incentivesApi.getIepSummaryForBooking = jest.fn().mockResolvedValue({})
    prisonApi.getPositiveCaseNotes = jest.fn().mockResolvedValue({})
    prisonApi.getNegativeCaseNotes = jest.fn().mockResolvedValue({})
    adjudicationsApi.getAdjudicationsForBooking = jest.fn().mockResolvedValue({})
    nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({})
    prisonApi.getVisitsSummary = jest.fn().mockResolvedValue({})
    prisonApi.getPrisonerVisitBalances = jest.fn().mockResolvedValue({})
    prisonApi.getEventsForToday = jest.fn().mockResolvedValue([])

    telemetry.trackEvent = jest.fn().mockResolvedValue([])

    systemOauthClient.getClientCredentialsTokens = jest.fn().mockReturnValue({})
    oauthApi.userRoles = jest.fn().mockReturnValue([])

    controller = prisonerQuickLook({
      prisonerProfileService,
      prisonApi,
      telemetry,
      systemOauthClient,
      incentivesApi,
      offenderSearchApi,
      oauthApi,
      adjudicationsApi,
      nonAssociationsApi,
    })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(
      res.locals,
      systemContext,
      offenderNo,
      false,
      prisonerSearchDetails
    )
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  it('should send custom event with username and active caseload', async () => {
    await controller(req, res)

    expect(telemetry.trackEvent).toHaveBeenCalledWith({
      name: 'ViewPrisonerProfile',
      properties: { username: 'user1', caseLoadId: 'MDI' },
    })
  })

  describe('offence data', () => {
    beforeEach(() => {
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for offence data', async () => {
      await controller(req, res)

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
        prisonApi.getMainOffence.mockResolvedValue([
          { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
        ])
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03' },
        ])
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
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2099-12-12' } })

        await controller(req, res)

        expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalled()
        expect(offenderSearchApi.getPrisonersDetails).not.toHaveBeenCalled()
      })

      it('should show Life Imprisonment alongside the release date if no release date is set and the offender has a life term', async () => {
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '' } })
        prisonerProfileService.getPrisonerProfileData.mockResolvedValue({
          ...prisonerProfileData,
          indeterminateSentence: true,
        })

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
        prisonApi.getPrisonerDetails.mockResolvedValue([
          { imprisonmentStatus: 'LIFE', imprisonmentStatusDesc: 'Serving Life Imprisonment' },
        ])
        prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '' } })

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
      it('should not show links if requested', async () => {
        const prisonerProfileDataNoLinks = { ...prisonerProfileService, showFinanceDetailLinks: false }
        prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileDataNoLinks)

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              {
                label: 'Spends',
                html: '<p>£100.00</p>',
                visible: true,
              },
              {
                label: 'Private cash',
                html: '<p>£75.50</p>',
                visible: true,
              },
              {
                label: 'Savings',
                html: '<p>£50.00</p>',
                visible: true,
              },
              {
                label: 'Damage obligations',
                html: '<p>£65.00</p>',
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
      prisonApi.getDetails.mockResolvedValue({ bookingId })

      await controller(req, res)

      expect(incentivesApi.getIepSummaryForBooking).toHaveBeenCalledWith(
        {
          user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        },
        bookingId
      )
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
                { label: 'Next review due by', html: 'Unable to show this detail' },
              ],
            },
          })
        )
      })
    })

    describe('when there is case note and adjudications data', () => {
      beforeEach(() => {
        incentivesApi.getIepSummaryForBooking.mockResolvedValue(iepSummaryForBooking)
        prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 2 })
        prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 1 })
        adjudicationsApi.getAdjudicationsForBooking.mockResolvedValue({
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
                { label: 'Next review due by', html: expect.stringContaining('15 August 2018') },
              ],
            },
          })
        )
      })

      it('should show when next incentive review is overdue when in the past', async () => {
        await controller(req, res)

        const context = res.render.mock.calls.at(-1)?.[1]
        const nextReviewDate = context?.incentives?.details?.at(-1)?.html
        expect(nextReviewDate).toContain('15 August 2018')
        expect(nextReviewDate).toContain('516 days overdue')
      })

      it('should show when next incentive review was overdue yesterday', async () => {
        incentivesApi.getIepSummaryForBooking.mockResolvedValue({
          ...iepSummaryForBooking,
          iepDate: '2019-01-12',
          iepTime: '2019-01-12T15:22:00',
          daysSinceReview: 1,
          nextReviewDate: '2020-01-12',
        })

        await controller(req, res)

        const context = res.render.mock.calls.at(-1)?.[1]
        const nextReviewDate = context?.incentives?.details?.at(-1)?.html
        expect(nextReviewDate).toContain('12 January 2020')
        expect(nextReviewDate).toContain('1 day overdue')
      })

      it('should not show that next incentive review is overdue when in future', async () => {
        incentivesApi.getIepSummaryForBooking.mockResolvedValue({
          ...iepSummaryForBooking,
          iepDate: '2019-12-16',
          iepTime: '2019-12-16T15:22:00',
          daysSinceReview: 28,
          nextReviewDate: '2020-12-16',
        })

        await controller(req, res)

        const context = res.render.mock.calls.at(-1)?.[1]
        const nextReviewDate = context?.incentives?.details?.at(-1)?.html
        expect(nextReviewDate).toContain('16 December 2020')
        expect(nextReviewDate).not.toContain('overdue')
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
                details: [{ label: 'Next visit date', value: 'None scheduled' }],
                visitSectionError: false,
                displayLink: false,
              },
            })
          )
        })
      })

      describe('when there is visit data', () => {
        beforeEach(() => {
          prisonApi.getVisitsSummary.mockResolvedValue({
            startDateTime: '2020-04-17T13:30:00',
            hasVisits: true,
          })
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

  describe('non-associations data', () => {
    beforeEach(() => {
      config.apis.nonAssociations.prisons = 'MDI,LEI'

      systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({ system: true })
    })

    describe('when the user is in a prison not part of the private beta', () => {
      beforeEach(() => {
        config.apis.nonAssociations.prisons = 'LEI,FEI'

        nonAssociationsApi.getNonAssociations.mockResolvedValue(prisonerNonAssociations)
      })

      it('should render the quick look template with the non-associations section disabled', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            nonAssociations: {
              sectionError: false,
              enabled: false,
              uiUrl: nonAssociationsUrl,
              prisonerNonAssociations,
            },
          })
        )
      })
    })

    it('should make a request for the correct data', async () => {
      nonAssociationsApi.getNonAssociations.mockResolvedValue(prisonerNonAssociations)

      await controller(req, res)

      expect(nonAssociationsApi.getNonAssociations).toHaveBeenCalledWith({ system: true }, offenderNo)
    })

    describe('when the request to Non-associations API fails', () => {
      beforeEach(() => {
        const error = new Error('Some error occurred')
        nonAssociationsApi.getNonAssociations.mockRejectedValue(error)
      })

      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            nonAssociations: {
              sectionError: true,
              enabled: true,
              uiUrl: nonAssociationsUrl,
              prisonerNonAssociations: null,
            },
          })
        )
      })
    })

    describe('when there is non-associations data', () => {
      beforeEach(() => {
        nonAssociationsApi.getNonAssociations.mockResolvedValue(prisonerNonAssociations)
      })

      it('should render the quick look template with the correctly formatted non-associations details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk',
          expect.objectContaining({
            nonAssociations: {
              sectionError: false,
              enabled: true,
              uiUrl: nonAssociationsUrl,
              prisonerNonAssociations,
            },
          })
        )
      })
    })
  })

  describe('when there are errors with getDetails', () => {
    const error = new Error('Network error')

    beforeEach(() => {
      req.params.offenderNo = offenderNo
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
      prisonerProfileService.getPrisonerProfileData = jest.fn().mockRejectedValue(new Error('Network error'))
      prisonApi.getMainOffence.mockRejectedValue(new Error('Network error'))
      prisonApi.getPrisonerBalances.mockRejectedValue(new Error('Network error'))
      prisonApi.getPrisonerDetails.mockRejectedValue(new Error('Network error'))
      prisonApi.getPrisonerSentenceDetails.mockRejectedValue(new Error('Network error'))
      incentivesApi.getIepSummaryForBooking.mockRejectedValue(new Error('Network error'))
      prisonApi.getPositiveCaseNotes.mockRejectedValue(new Error('Network error'))
      prisonApi.getNegativeCaseNotes.mockRejectedValue(new Error('Network error'))
      adjudicationsApi.getAdjudicationsForBooking.mockRejectedValue(new Error('Network error'))
      prisonApi.getVisitsSummary.mockRejectedValue(new Error('Network error'))
      prisonApi.getPrisonerVisitBalances.mockRejectedValue(new Error('Network error'))
      prisonApi.getEventsForToday.mockRejectedValue(new Error('Network error'))
    })

    it('should handle api errors when requesting main offence', async () => {
      prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
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
      prisonApi.getPrisonerSentenceDetails.mockResolvedValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
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

    it('should handle api error when requesting the release date', async () => {
      prisonApi.getMainOffence.mockResolvedValue([
        { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
      ])
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
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      incentivesApi.getIepSummaryForBooking.mockResolvedValue(iepSummaryForBooking)
      adjudicationsApi.getAdjudicationsForBooking.mockResolvedValue({
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
              { label: 'Next review due by', html: expect.stringContaining('15 August 2018') },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting incentive encouragements', async () => {
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      incentivesApi.getIepSummaryForBooking.mockResolvedValue(iepSummaryForBooking)
      adjudicationsApi.getAdjudicationsForBooking.mockResolvedValue({
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
              { label: 'Next review due by', html: expect.stringContaining('15 August 2018') },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting last incentive level review', async () => {
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      adjudicationsApi.getAdjudicationsForBooking.mockResolvedValue({
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
              { label: 'Next review due by', html: 'Unable to show this detail' },
            ],
          },
        })
      )
    })

    it('should handle api errors when requesting adjudications', async () => {
      prisonApi.getPositiveCaseNotes.mockResolvedValue({ count: 10 })
      prisonApi.getNegativeCaseNotes.mockResolvedValue({ count: 10 })
      incentivesApi.getIepSummaryForBooking.mockResolvedValue(iepSummaryForBooking)

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
              { label: 'Next review due by', html: expect.stringContaining('15 August 2018') },
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
                label: 'Next review due by',
                html: 'Unable to show this detail',
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
      prisonApi.getDetails = jest.fn().mockResolvedValue({})
      prisonApi.getMainOffence = jest.fn().mockResolvedValue([])
      prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})
      prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([])
      prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({})
      incentivesApi.getIepSummaryForBooking = jest.fn().mockResolvedValue({})
      prisonApi.getPositiveCaseNotes = jest.fn().mockResolvedValue({})
      prisonApi.getNegativeCaseNotes = jest.fn().mockResolvedValue({})
      adjudicationsApi.getAdjudicationsForBooking = jest.fn().mockResolvedValue({})
      prisonApi.getVisitsSummary = jest.fn().mockResolvedValue({})
      prisonApi.getPrisonerVisitBalances = jest.fn().mockResolvedValue({})
      prisonApi.getEventsForToday = jest.fn().mockResolvedValue([])
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
              { label: 'Next review due by', html: 'Unable to show this detail' },
            ],
          },
        })
      )
    })

    it('should display correct default personal details', async () => {
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
            showFinanceDetailLinks: true,
            indeterminateSentence: false,
          },
        })
      )
    })
  })
})
