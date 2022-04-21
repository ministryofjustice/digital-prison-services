import moment from 'moment'
import { switchDateFormat } from '../../utils'
import log from '../../log'

export const attendanceFactory = (whereaboutsApi) => {
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

  const batchUpdateAttendance = (context, body) => {
    const { attended, paid, reason, comments, offenders } = body
    const offenderCount = offenders.length
    log.info(`Number of offenders to be paid ${offenderCount}`)

    const { eventLocationId, period, eventDate, prisonId } = offenders[0]
    const bookingActivities = offenders.map((offender) => ({
      bookingId: offender.bookingId,
      activityId: offender.eventId,
    }))

    const payload = {
      attended,
      paid,
      reason,
      comments,
      bookingActivities,
      eventLocationId,
      period,
      eventDate: eventDate === 'Today' ? moment().format('YYYY-MM-DD') : switchDateFormat(eventDate),
      prisonId,
    }

    return whereaboutsApi.postAttendances(context, payload)
  }

  const getAbsenceReasons = async (context) => {
    const absenceReasons = await whereaboutsApi.getAbsenceReasons(context)
    const {
      paidReasons,
      unpaidReasons,
      triggersIEPWarning,
      triggersAbsentSubReason,
      paidSubReasons,
      unpaidSubReasons,
    } = absenceReasons

    return {
      paidReasons: paidReasons.map((r) => ({ value: r.code, name: r.name })),
      unpaidReasons: unpaidReasons.map((r) => ({
        value: r.code,
        name: triggersIEPWarning.includes(r.code) ? `${r.name} - incentive level warning` : r.name,
      })),
      unpaidReasonsWithoutIep: unpaidReasons
        .map((r) => ({ value: r.code, name: r.name }))
        .filter((r) => !triggersIEPWarning.includes(r.value)),
      triggersIEP: triggersIEPWarning.map((r) => r.replace('IncentiveLevelWarning', '')),
      triggersAbsentSubReason,
      paidSubReasons: paidSubReasons.map((r) => ({ value: r.code, name: r.name })),
      unpaidSubReasons: unpaidSubReasons.map((r) => ({ value: r.code, name: r.name })),
    }
  }

  return {
    updateAttendance,
    batchUpdateAttendance,
    getAbsenceReasons,
  }
}

export default { attendanceFactory }
