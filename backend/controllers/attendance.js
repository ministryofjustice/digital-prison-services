const moment = require('moment')
const { switchDateFormat, pascalToString } = require('../utils')
const log = require('../log')

const attendanceFactory = (elite2Api, whereaboutsApi) => {
  const postAttendance = async (context, attendance) => {
    if (!attendance || !attendance.offenderNo) {
      throw new Error('Offender number missing')
    }

    const {
      attended,
      offenderNo,
      eventDate,
      eventId,
      eventLocationId,
      paid,
      period,
      prisonId,
      absentReason,
      comments,
    } = attendance
    const details = await elite2Api.getDetailsLight(context, offenderNo)
    const date = eventDate === 'Today' ? moment().format('DD/MM/YYYY') : eventDate
    const body = {
      offenderNo,
      absentReason,
      comments,
      bookingId: details.bookingId,
      attended,
      eventDate: switchDateFormat(date),
      eventId,
      eventLocationId,
      paid,
      period,
      prisonId,
    }

    await whereaboutsApi.postAttendance(context, body)
    log.info({}, 'postAttendance success')
  }

  const putAttendance = async (context, attendance, id) => {
    if (!attendance || !id) {
      throw new Error('Attendance or ID is missing')
    }

    await whereaboutsApi.putAttendance(context, attendance, id)
    log.info({}, 'putAttendance success')
  }

  const getAbsenceReasons = async (context, body) => {
    const absenceReasons = await whereaboutsApi.getAbsenceReasons(context, body)

    return {
      paidReasons: absenceReasons.paidReasons.map(reason => ({ value: reason, name: pascalToString(reason) })),
      unpaidReasons: absenceReasons.unpaidReasons.map(reason => ({ value: reason, name: pascalToString(reason) })),
    }
  }

  return {
    postAttendance,
    putAttendance,
    getAbsenceReasons,
  }
}

module.exports = { attendanceFactory }
