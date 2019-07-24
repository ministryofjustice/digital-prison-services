const moment = require('moment')
const { switchDateFormat } = require('../utils')
const log = require('../log')

const { absentReasonMapper } = require('../mappers')

const attendanceFactory = whereaboutsApi => {
  const sortByName = (a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  }

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

    const { paidReasons, unpaidReasons } = absenceReasons
    const mapToAbsentReason = absentReasonMapper(absenceReasons)

    const approvedCourse = {
      value: 'ApprovedCourse',
      name: 'Approved course',
    }

    const paidReasonsExcluding = name =>
      paidReasons
        .filter(reason => reason !== name)
        .map(mapToAbsentReason)
        .sort(sortByName)

    return {
      paidReasons: [approvedCourse, ...paidReasonsExcluding(approvedCourse.value)],
      unpaidReasons: unpaidReasons.map(mapToAbsentReason).sort(sortByName),
    }
  }

  return {
    updateAttendance,
    getAbsenceReasons,
  }
}

module.exports = { attendanceFactory }
