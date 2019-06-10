Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const context = {}
const elite2Api = {}
const whereaboutsApi = {}
const { postAttendance, putAttendance, getAbsenceReasons } = require('../controllers/attendance').attendanceFactory(
  elite2Api,
  whereaboutsApi
)

describe('Attendence and Pay controller', async () => {
  describe('postAttendance', () => {
    const offenderNo = 'ABC123'

    it('should throw an error when offenderNo is null', async done => {
      try {
        await postAttendance(context)
      } catch (e) {
        expect(e).toEqual(new Error('Offender number missing'))
        done()
      }
    })

    beforeEach(() => {
      whereaboutsApi.postAttendance = jest.fn()
      elite2Api.getDetailsLight = jest.fn()
      elite2Api.getDetailsLight.mockReturnValue({
        bookingId: 1,
      })
    })

    it('should call getDetailsLight with the correct offenderNo', async () => {
      await postAttendance(context, { offenderNo })

      expect(elite2Api.getDetailsLight).toHaveBeenCalledWith(context, 'ABC123')
    })

    it('should post attendance', async () => {
      const attendenceDetails = {
        offenderNo,
        period: 'AM',
        prisonId: 'LEI',
        eventId: 45,
        eventLocationId: 1,
        attended: true,
        paid: true,
      }

      await postAttendance(context, {
        offenderNo,
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.postAttendance).toHaveBeenCalledWith(context, {
        bookingId: 1,
        eventDate: '2019-10-10',
        ...attendenceDetails,
      })
    })

    it('should call postAttendance with the correct absent reason and comments text', async () => {
      elite2Api.createCaseNote = jest.fn()
      const comments = 'Was absent but his reason was acceptable.'

      const attendenceDetails = {
        offenderNo,
        period: 'AM',
        prisonId: 'LEI',
        eventId: 45,
        eventLocationId: 1,
        attended: false,
        paid: true,
      }

      await postAttendance(context, {
        absentReason: 'AcceptableAbsence',
        comments,
        offenderNo,
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.postAttendance).toHaveBeenCalledWith(context, {
        absentReason: 'AcceptableAbsence',
        comments,
        bookingId: 1,
        eventDate: '2019-10-10',
        ...attendenceDetails,
      })
    })
  })

  describe('putAttendance', () => {
    it('should throw an error when id is null', async done => {
      try {
        await putAttendance(context)
      } catch (e) {
        expect(e).toEqual(new Error('Attendance or ID is missing'))
        done()
      }
    })

    beforeEach(() => {
      whereaboutsApi.putAttendance = jest.fn()
    })

    it('should call putAttendance with the correct details and ID', async () => {
      const updatedAttendanceDetails = {
        absentReason: 'AcceptableAbsence',
        attended: true,
        comments: 'string',
        paid: true,
      }

      await putAttendance(context, updatedAttendanceDetails, 1)

      expect(whereaboutsApi.putAttendance).toBeCalledWith(context, updatedAttendanceDetails, 1)
    })
  })

  describe('getAbsenceReasons', () => {
    beforeEach(() => {
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        paidReasons: ['AcceptableAbsence', 'RestInCell'],
        unpaidReasons: ['UnacceptableAbsence'],
      })
    })

    it('should call getAbsenceReasons and return formatted array of options', async () => {
      const response = await getAbsenceReasons(context)

      expect(response).toEqual({
        paidReasons: [
          { name: 'Acceptable absence', value: 'AcceptableAbsence' },
          { name: 'Rest in cell', value: 'RestInCell' },
        ],
        unpaidReasons: [{ name: 'Unacceptable absence', value: 'UnacceptableAbsence' }],
      })
    })
  })
})
