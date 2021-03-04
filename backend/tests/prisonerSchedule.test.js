const prisonerSchedule = require('../controllers/prisonerProfile/prisonerSchedule')

describe('Prisoner schedule', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith ' })
    prisonApi.getScheduledEventsForThisWeek = jest.fn().mockResolvedValue([])
    prisonApi.getScheduledEventsForNextWeek = jest.fn().mockResolvedValue([])

    controller = prisonerSchedule({ prisonApi, logError })

    jest.spyOn(Date, 'now').mockImplementation(() => 1595548800000) // Friday, 24 July 2020 00:00:00
  })

  afterEach(() => {
    Date.now.mockRestore()
  })

  it('should get the prisoner details', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
  })

  describe('when visiting the page with no query', () => {
    it('should get the schedule for this week', async () => {
      await controller(req, res)

      expect(prisonApi.getScheduledEventsForThisWeek).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('without data', () => {
      it('should render the template with the correct days of the week', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerSchedule/prisonerSchedule.njk', {
          breadcrumbPrisonerName: 'Smith , John',
          days: [
            {
              date: 'Friday 24 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Saturday 25 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Sunday 26 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Monday 27 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Tuesday 28 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Wednesday 29 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Thursday 30 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
          ],
          nextWeekStartDate: '31 July 2020',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith ',
          when: undefined,
        })
      })
    })

    describe('with data', () => {
      beforeEach(() => {
        prisonApi.getScheduledEventsForThisWeek.mockResolvedValue([
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'GYMF',
            eventSubTypeDesc: 'Gym - Football',
            eventDate: '2020-07-24',
            startTime: '2020-07-24T16:30:00',
            endTime: '2020-07-24T17:30:00',
            eventLocation: 'FOOTBALL',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Test',
          },
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'MEDE',
            eventSubTypeDesc: 'Medical - Dentist',
            eventDate: '2020-07-26',
            startTime: '2020-07-26T08:00:00',
            endTime: '2020-07-26T09:00:00',
            eventLocation: 'HEALTH CARE',
            eventSource: 'APP',
            eventSourceCode: 'APP',
          },
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'CSS',
            eventSubTypeDesc: 'Counselling Session',
            eventDate: '2020-07-26',
            startTime: '2020-07-26T10:00:00',
            endTime: '2020-07-26T11:00:00',
            eventLocation: 'OFFICIAL VISITS',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Testing comments',
          },
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'CHAP',
            eventSubTypeDesc: 'Chaplaincy',
            eventDate: '2020-07-26',
            startTime: '2020-07-26T21:00:00',
            endTime: '2020-07-26T22:05:00',
            eventLocation: 'CHAPEL',
            eventSource: 'APP',
            eventSourceCode: 'APP',
          },
        ])
      })

      it('should render the template with the correct days of the week', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerSchedule/prisonerSchedule.njk', {
          breadcrumbPrisonerName: 'Smith , John',
          days: [
            {
              date: 'Friday 24 July 2020',
              periods: {
                afternoonActivities: [
                  {
                    cancelled: false,
                    comment: 'Test',
                    endTime: '2020-07-24T17:30:00',
                    eventStatus: 'SCH',
                    shortComment: 'Test',
                    startTime: '2020-07-24T16:30:00',
                    type: 'Gym - Football',
                  },
                ],
                eveningActivities: [],
                morningActivities: [],
              },
            },
            {
              date: 'Saturday 25 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Sunday 26 July 2020',
              periods: {
                afternoonActivities: [],
                eveningActivities: [
                  {
                    cancelled: false,
                    comment: undefined,
                    endTime: '2020-07-26T22:05:00',
                    eventStatus: 'SCH',
                    shortComment: undefined,
                    startTime: '2020-07-26T21:00:00',
                    type: 'Chaplaincy',
                  },
                ],
                morningActivities: [
                  {
                    cancelled: false,
                    comment: undefined,
                    endTime: '2020-07-26T09:00:00',
                    eventStatus: 'SCH',
                    shortComment: undefined,
                    startTime: '2020-07-26T08:00:00',
                    type: 'Medical - Dentist',
                  },
                  {
                    cancelled: false,
                    comment: 'Testing comments',
                    endTime: '2020-07-26T11:00:00',
                    eventStatus: 'SCH',
                    shortComment: 'Testing comments',
                    startTime: '2020-07-26T10:00:00',
                    type: 'Counselling Session',
                  },
                ],
              },
            },
            {
              date: 'Monday 27 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Tuesday 28 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Wednesday 29 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Thursday 30 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
          ],
          nextWeekStartDate: '31 July 2020',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith ',
          when: undefined,
        })
      })
    })
  })

  describe('when visiting the page with a query for next week', () => {
    beforeEach(() => {
      req.query.when = 'nextWeek'
    })

    it('should get the schedule for next week', async () => {
      await controller(req, res)

      expect(prisonApi.getScheduledEventsForNextWeek).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('without data', () => {
      it('should render the template with the correct days of the week', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerSchedule/prisonerSchedule.njk', {
          breadcrumbPrisonerName: 'Smith , John',
          days: [
            {
              date: 'Friday 31 July 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Saturday 1 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Sunday 2 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Monday 3 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Tuesday 4 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Wednesday 5 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
            {
              date: 'Thursday 6 August 2020',
              periods: { afternoonActivities: undefined, eveningActivities: undefined, morningActivities: undefined },
            },
          ],
          nextWeekStartDate: '31 July 2020',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith ',
          when: 'nextWeek',
        })
      })
    })
  })
})
