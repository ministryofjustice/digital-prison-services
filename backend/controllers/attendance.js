const moment = require('moment')
const { switchDateFormat } = require('../utils')
const log = require('../log')

const { absentReasonMapper } = require('../mappers')

const attendanceFactory = whereaboutsApi => {
  const updateAttendance = async (context, attendance) => {
    if (!attendance || !attendance.bookingId) {
      throw new Error('Booking ID is missing')
    }

    let response
    const { id, eventDate, ...rest } = attendance
    const date = eventDate === 'Today' ? moment().format('DD/MM/YYYY') : eventDate
    const body = { ...rest, eventDate: switchDateFormat(date) }

    if (id) {
      response = await whereaboutsApi.putAttendance(context, body, id)
      log.info({}, 'putAttendance success')
    } else {
      response = await whereaboutsApi.postAttendance(context, body)
      log.info({}, 'postAttendance success')
    }

    return response
  }

  const getAbsenceReasons = async context => {
    const absentReasons = await whereaboutsApi.getAbsenceReasons(context)

    const { paidReasons, unpaidReasons } = absentReasons
    const mapToAbsentReason = absentReasonMapper(absentReasons)

    return {
      paidReasons: paidReasons.map(mapToAbsentReason),
      unpaidReasons: unpaidReasons.map(mapToAbsentReason),
    }
  }

  return {
    updateAttendance,
    getAbsenceReasons,
  }
}

module.exports = { attendanceFactory }
