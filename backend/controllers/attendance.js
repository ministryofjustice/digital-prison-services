const moment = require('moment')
const { switchDateFormat, pascalToString } = require('../utils')
const log = require('../log')

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
    const absenceReasons = await whereaboutsApi.getAbsenceReasons(context)

    const unpaidReasonName = reason => {
      const name = pascalToString(reason)
      if (absenceReasons.triggersIEPWarning.includes(reason)) {
        return `${name} - IEP`
      }
      return name
    }

    return {
      paidReasons: absenceReasons.paidReasons.map(reason => ({ value: reason, name: pascalToString(reason) })),
      unpaidReasons: absenceReasons.unpaidReasons.map(reason => ({ value: reason, name: unpaidReasonName(reason) })),
    }
  }

  return {
    updateAttendance,
    getAbsenceReasons,
  }
}

module.exports = { attendanceFactory }
