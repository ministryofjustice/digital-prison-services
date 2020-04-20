const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook.js')
const { serviceUnavailableMessage } = require('../common-messages')

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
  }
  const bookingId = '123'
  const elite2Api = {}
  const prisonerProfileService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockReturnValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockReturnValue({})
    elite2Api.getMainOffence = jest.fn().mockReturnValue([])
    elite2Api.getPrisonerBalances = jest.fn().mockReturnValue({})
    elite2Api.getPrisonerDetails = jest.fn().mockReturnValue([])
    elite2Api.getPrisonerSentenceDetails = jest.fn().mockReturnValue({})
    elite2Api.getIepSummaryForBooking = jest.fn().mockReturnValue({})
    elite2Api.getPositiveCaseNotes = jest.fn().mockReturnValue({})
    elite2Api.getNegativeCaseNotes = jest.fn().mockReturnValue({})
    elite2Api.getAdjudicationsForBooking = jest.fn().mockReturnValue({})
    elite2Api.getNextVisit = jest.fn().mockReturnValue({})
    elite2Api.getPrisonerVisitBalances = jest.fn().mockReturnValue({})
    elite2Api.getEventsForToday = jest.fn().mockReturnValue([])

    controller = prisonerQuickLook({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    elite2Api.getDetails.mockReturnValue({ bookingId })

    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerQuickLook.njk',
      expect.objectContaining({
        dpsUrl: 'http://localhost:3000/',
        prisonerProfileData,
      })
    )
  })

  describe('offence data', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockReturnValue({ bookingId })
    })

    it('should make a call for offence data', async () => {
      await controller(req, res)

      expect(elite2Api.getMainOffence).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing offence data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence(s)',
                value: false,
              },
              {
                label: 'Imprisonment status',
                value: false,
              },
              {
                label: 'Release date',
                value: undefined,
              },
            ],
          })
        )
      })
    })

    describe('when there is offence data', () => {
      beforeEach(() => {
        elite2Api.getMainOffence.mockReturnValue([
          { offenceDescription: 'Have blade/article which was sharply pointed in public place' },
        ])
        elite2Api.getPrisonerDetails.mockReturnValue([
          { imprisonmentStatusDesc: 'Adult Imprisonment Without Option CJA03' },
        ])
        elite2Api.getPrisonerSentenceDetails.mockReturnValue({ sentenceDetail: { releaseDate: '2020-12-13' } })
      })

      it('should render the quick look template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            offenceDetails: [
              {
                label: 'Main offence(s)',
                value: 'Have blade/article which was sharply pointed in public place',
              },
              {
                label: 'Imprisonment status',
                value: 'Adult Imprisonment Without Option CJA03',
              },
              {
                label: 'Release date',
                value: '13/12/2020',
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
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              { label: 'Spends', value: '' },
              { label: 'Private', value: '' },
              { label: 'Savings', value: '' },
            ],
          })
        )
      })
    })

    describe('when there is balance data', () => {
      beforeEach(() => {
        elite2Api.getPrisonerBalances.mockReturnValue({ spends: 100, cash: 75.5, savings: 50, currency: 'GBP' })
      })

      it('should render the quick look template with the correctly formatted balance/money data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            balanceDetails: [
              { label: 'Spends', value: '£100.00' },
              { label: 'Private', value: '£75.50' },
              { label: 'Savings', value: '£50.00' },
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
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: undefined },
              { label: 'Nationality', value: undefined },
              { label: 'PNC number', value: undefined },
              { label: 'CRO number', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is personal data', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1578873601000) // 2020-01-13T00:00:01.000Z
        elite2Api.getPrisonerDetails.mockReturnValue([
          { dateOfBirth: '1998-12-01', nationalities: 'Brtish', pncNumber: '12/3456A', croNumber: '12345/57B' },
        ])
      })

      it('should render the quick look template with the correctly formatted personal details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            personalDetails: [
              { label: 'Age', value: 21 },
              { label: 'Nationality', value: 'Brtish' },
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
      elite2Api.getDetails.mockReturnValue({ bookingId })

      await controller(req, res)

      expect(elite2Api.getIepSummaryForBooking).toHaveBeenCalledWith({}, bookingId, false)
      expect(elite2Api.getPositiveCaseNotes).toHaveBeenCalledWith({}, bookingId, '2019-10-13', '2020-01-13')
    })

    describe('when there is missing case note and adjudications data', () => {
      it('should still render the quick look template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            caseNoteAdjudications: {
              details: [
                { label: 'Incentive level warnings', value: undefined },
                { label: 'Incentive Encouragements', value: undefined },
                { label: 'Last incentive level review', value: undefined },
                { label: 'Proven adjudications', value: undefined },
              ],
              activeAdjudicationsDetails: { label: 'Active adjudications', value: undefined },
            },
          })
        )
      })
    })

    describe('when there is case note and adjudications data', () => {
      beforeEach(() => {
        elite2Api.getIepSummaryForBooking.mockReturnValue({ daysSinceReview: 40 })
        elite2Api.getPositiveCaseNotes.mockReturnValue({ count: 2 })
        elite2Api.getNegativeCaseNotes.mockReturnValue({ count: 1 })
        elite2Api.getAdjudicationsForBooking.mockReturnValue({
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

      it('should render the quick look template with the correctly formatted case note and adjucation details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            caseNoteAdjudications: {
              details: [
                { label: 'Incentive level warnings', value: 1 },
                { label: 'Incentive Encouragements', value: 2 },
                { label: 'Last incentive level review', value: 40 },
                { label: 'Proven adjudications', value: 3 },
              ],
              activeAdjudicationsDetails: {
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
            'prisonerProfile/prisonerQuickLook.njk',
            expect.objectContaining({
              visits: {
                details: [
                  { label: 'Remaining visits', value: undefined },
                  { label: 'Remaining privileged visits', value: undefined },
                  { label: 'Next visit date', value: 'No upcoming visits' },
                ],
              },
            })
          )
        })
      })

      describe('when there is visit data', () => {
        beforeEach(() => {
          elite2Api.getNextVisit.mockReturnValue({
            visitTypeDescription: 'Social Contact',
            leadVisitor: 'YRUDYPETER CASSORIA',
            relationshipDescription: 'Probation Officer',
            startTime: '2020-04-17T13:30:00',
          })
          elite2Api.getPrisonerVisitBalances.mockReturnValue({ remainingVo: 24, remainingPvo: 4 })
        })

        it('should render the quick look template with the correctly formatted visit details', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerQuickLook.njk',
            expect.objectContaining({
              visits: {
                details: [
                  { label: 'Remaining visits', value: 24 },
                  { label: 'Remaining privileged visits', value: 4 },
                  { label: 'Next visit date', value: '17/04/2020' },
                ],
                nextVisitDetails: [
                  { label: 'Type of visit', value: 'Social Contact' },
                  { label: 'Lead visitor', value: 'Yrudypeter Cassoria (Probation Officer)' },
                ],
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
            'prisonerProfile/prisonerQuickLook.njk',
            expect.objectContaining({
              scheduledActivityPeriods: [
                { label: 'Morning (AM)', value: [] },
                { label: 'Afternoon (PM)', value: [] },
                { label: 'Evening (ED)', value: [] },
              ],
            })
          )
        })
      })
    })

    describe('when there is visit data', () => {
      beforeEach(() => {
        elite2Api.getEventsForToday.mockReturnValue([
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
          'prisonerProfile/prisonerQuickLook.njk',
          expect.objectContaining({
            scheduledActivityPeriods: [
              {
                label: 'Morning (AM)',
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
                label: 'Afternoon (PM)',
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
                label: 'Evening (ED)',
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

  describe('when there are errors with elite2Api', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))
    })

    it('should render the error template', async () => {
      await controller(req, res)

      expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: 'http://localhost:3000/' })
    })
  })
})
