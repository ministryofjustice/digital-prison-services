import attendanceController from '../controllers/attendance/attendance'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

describe('Attendence and Pay controller', () => {
  const context = {}
  const whereaboutsApi = {
    postAttendance: jest.fn(),
    putAttendance: jest.fn(),
    getAbsenceReasons: jest.fn(),
    postAttendances: jest.fn(),
  }
  const { updateAttendance, getAbsenceReasons, batchUpdateAttendance } =
    attendanceController.attendanceFactory(whereaboutsApi)
  const attendenceDetails = {
    offenderNo: 'ABC123',
    bookingId: 1,
    period: 'AM',
    prisonId: 'LEI',
    eventId: 45,
    eventLocationId: 1,
    attended: true,
    paid: true,
  }

  describe('updateAttendance', () => {
    it('should throw an error when offenderNo is null', () => {
      try {
        updateAttendance(context, {})
      } catch (e) {
        expect(e).toEqual(new Error('Booking ID is missing'))
      }
    })

    it('should postAttendance when there is no attendance ID', async () => {
      await updateAttendance(context, {
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.postAttendance).toHaveBeenCalledWith(context, {
        eventDate: '2019-10-10',
        ...attendenceDetails,
      })
    })

    it('should call putAttendance when there is an attendance ID', async () => {
      const id = 1

      await updateAttendance(context, {
        id,
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.putAttendance).toHaveBeenCalledWith(
        context,
        {
          eventDate: '2019-10-10',
          ...attendenceDetails,
        },
        id
      )
    })
  })

  describe('getAbsenceReasons', () => {
    beforeEach(() => {
      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        paidReasons: [
          { code: 'ApprovedCourse', name: 'Approved course' },
          { code: 'AcceptableAbsence', name: 'Acceptable absence' },
          { code: 'NotRequired', name: 'Not required to attend' },
        ],
        unpaidReasons: [
          { code: 'RefusedIncentiveLevelWarning', name: 'Refused to attend' },
          { code: 'RestInCellOrSick', name: 'Rest in cell or sick' },
          { code: 'SessionCancelled', name: 'Session cancelled' },
          { code: 'UnacceptableAbsenceIncentiveLevelWarning', name: 'Unacceptable absence' },
        ],
        triggersIEPWarning: ['UnacceptableAbsenceIncentiveLevelWarning', 'RefusedIncentiveLevelWarning'],
        triggersAbsentSubReason: [
          'AcceptableAbsence',
          'Refused',
          'RefusedIncentiveLevelWarning',
          'SessionCancelled',
          'UnacceptableAbsenceIncentiveLevelWarning',
        ],
        paidSubReasons: [
          { code: 'Activities', name: 'Activities and education' },
          { code: 'Courses', name: 'Courses, programmes and interventions' },
        ],
        unpaidSubReasons: [
          { code: 'Activities', name: 'Activities and education' },
          { code: 'Behaviour', name: 'Behaviour' },
        ],
      })
    })

    it('should call getAbsenceReasons and return formatted array of options alphabetically', async () => {
      const response = await getAbsenceReasons(context)

      expect(response).toEqual({
        paidReasons: [
          { name: 'Approved course', value: 'ApprovedCourse' },
          { name: 'Acceptable absence', value: 'AcceptableAbsence' },
          { name: 'Not required to attend', value: 'NotRequired' },
        ],
        unpaidReasons: [
          { name: 'Refused to attend - incentive level warning', value: 'RefusedIncentiveLevelWarning' },
          { name: 'Rest in cell or sick', value: 'RestInCellOrSick' },
          { name: 'Session cancelled', value: 'SessionCancelled' },
          { name: 'Unacceptable absence - incentive level warning', value: 'UnacceptableAbsenceIncentiveLevelWarning' },
        ],
        unpaidReasonsWithoutIep: [
          { name: 'Rest in cell or sick', value: 'RestInCellOrSick' },
          { name: 'Session cancelled', value: 'SessionCancelled' },
        ],
        triggersIEP: ['UnacceptableAbsence', 'Refused'],
        triggersAbsentSubReason: [
          'AcceptableAbsence',
          'Refused',
          'RefusedIncentiveLevelWarning',
          'SessionCancelled',
          'UnacceptableAbsenceIncentiveLevelWarning',
        ],
        paidSubReasons: [
          { value: 'Activities', name: 'Activities and education' },
          { value: 'Courses', name: 'Courses, programmes and interventions' },
        ],
        unpaidSubReasons: [
          { value: 'Activities', name: 'Activities and education' },
          { value: 'Behaviour', name: 'Behaviour' },
        ],
      })
    })
  })

  describe('batchUpdateAttendance', () => {
    beforeEach(() => {
      whereaboutsApi.postAttendances = jest.fn()
    })

    const offenders = [
      {
        offenderNo: 123,
        bookingId: 1,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 345,
        bookingId: 2,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 678,
        bookingId: 3,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
    ]

    it('should call postAttendances with list of valid offenders', async () => {
      await batchUpdateAttendance(context, { attended: true, paid: true, offenders })
      expect(whereaboutsApi.postAttendances).toHaveBeenCalledTimes(1)
      expect(whereaboutsApi.postAttendances.mock.calls[0]).toEqual([
        context,
        {
          bookingActivities: [
            {
              activityId: 123,
              bookingId: 1,
            },
            {
              activityId: 123,
              bookingId: 2,
            },
            {
              activityId: 123,
              bookingId: 3,
            },
          ],
          eventDate: '2019-06-29',
          eventLocationId: 123,
          period: 'AM',
          prisonId: 'LEI',
          attended: true,
          paid: true,
        },
      ])
    })

    it('should call postAttendances with list of valid offenders and additional comments and absent reason', async () => {
      const comments = 'Supporting comments.'
      const reason = 'NotRequired'

      await batchUpdateAttendance(context, { attended: true, paid: true, offenders, comments, reason })
      expect(whereaboutsApi.postAttendances).toHaveBeenCalledTimes(1)
      expect(whereaboutsApi.postAttendances.mock.calls[0]).toEqual([
        context,
        {
          bookingActivities: [
            {
              activityId: 123,
              bookingId: 1,
            },
            {
              activityId: 123,
              bookingId: 2,
            },
            {
              activityId: 123,
              bookingId: 3,
            },
          ],
          eventDate: '2019-06-29',
          eventLocationId: 123,
          period: 'AM',
          prisonId: 'LEI',
          attended: true,
          paid: true,
          comments,
          reason,
        },
      ])
    })
  })
})
