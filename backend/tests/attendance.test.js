Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const context = {}
const whereaboutsApi = {}
const { updateAttendance, getAbsenceReasons } = require('../controllers/attendance').attendanceFactory(whereaboutsApi)

describe('Attendence and Pay controller', async () => {
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
    it('should throw an error when offenderNo is null', async done => {
      try {
        await updateAttendance(context)
      } catch (e) {
        expect(e).toEqual(new Error('Booking ID is missing'))
        done()
      }
    })

    beforeEach(() => {
      whereaboutsApi.postAttendance = jest.fn()
      whereaboutsApi.putAttendance = jest.fn()
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
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        paidReasons: ['AcceptableAbsence', 'RestInCell', 'ApprovedCourse'],
        unpaidReasons: ['Refused', 'UnacceptableAbsence'],
        triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
      })
    })

    it('should call getAbsenceReasons and return formatted array of options alphabetically', async () => {
      const response = await getAbsenceReasons(context)

      expect(response).toEqual({
        paidReasons: [
          { name: 'Approved course', value: 'ApprovedCourse' },
          { name: 'Acceptable', value: 'AcceptableAbsence' },
          { name: 'Rest in cell', value: 'RestInCell' },
        ],
        unpaidReasons: [
          { name: 'Refused - IEP', value: 'Refused' },
          { name: 'Unacceptable - IEP', value: 'UnacceptableAbsence' },
        ],
      })
    })
  })
})
