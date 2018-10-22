const momentTimeZone = require('moment-timezone')
const log = require('../log')

const updateAttendanceFactory = elite2Api => {
  const updateAttendance = async (context, offenderNo, activityId, body) => {
    if (!offenderNo || !activityId) {
      throw new Error('Offender or activity id missing')
    }
    await elite2Api.updateAttendance(context, offenderNo, activityId, body)
    log.info({}, 'updateAttendance success')
    if (body.eventOutcome === 'UNACAB' && body.performance === 'UNACCEPT') {
      const zone = 'Europe/London'
      const now = momentTimeZone.tz(zone)
      const caseNoteBody = {
        type: 'Negative Behaviour',
        subType: 'IEP Warning',
        occurrenceDateTime: now.format('YYYY-MM-DDThh:mm'),
        text: 'Refused to attend activity / education.',
      }
      await elite2Api.createCaseNote(context, offenderNo, caseNoteBody)
      log.info({}, 'casenote created')
    }
  }

  return {
    updateAttendance,
  }
}

module.exports = { updateAttendanceFactory }
