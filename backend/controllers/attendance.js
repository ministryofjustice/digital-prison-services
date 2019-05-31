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

  const getAbsenceReasons = async (context, body) => {
    const absenceReasons = await whereaboutsApi.getAbsenceReasons(context, body)

    return {
      paidReasons: absenceReasons.paidReasons.map(reason => ({ value: reason, name: pascalToString(reason) })),
      unpaidReasons: absenceReasons.unpaidReasons.map(reason => ({ value: reason, name: pascalToString(reason) })),
    }
  }

  return {
    postAttendance,
    getAbsenceReasons,
  }
}

module.exports = { attendanceFactory }
