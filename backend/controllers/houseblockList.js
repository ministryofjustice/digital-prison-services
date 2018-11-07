/* eslint-disable no-lonely-if */
const moment = require('moment')
const getExternalEventsForOffenders = require('../shared/getExternalEventsForOffenders')
const log = require('../log')
const { switchDateFormat, distinct } = require('../utils')

function safeTimeCompare(a, b) {
  if (a && b) return moment(b).isBefore(a)
  return !a
}

const shouldPromoteToMainActivity = (offender, newActivity) => {
  if (newActivity.eventType !== 'PRISON_ACT') return false
  if (!offender.activity) return true

  if (offender.activity.payRate && !newActivity.payRate) {
    return false
  }

  if (!offender.activity.payRate && newActivity.payRate) {
    return true
  }
  // Multiple paid activities, or neither paid - make the earliest starting one the main one
  return Boolean(safeTimeCompare(offender.activity.startTime, newActivity.startTime))
}

const promoteToMainActivity = (offender, activity) => {
  if (offender.activity) {
    const oldMainActivity = offender.activity
    return {
      ...offender,
      activity,
      others: [...offender.others, oldMainActivity],
    }
  }

  return {
    ...offender,
    activity,
  }
}

const addToOtherActivities = (offender, activity) => ({
  ...offender,
  others: [...offender.others, activity],
})

const getHouseblockListFactory = elite2Api => {
  const getHouseblockList = async (context, agencyId, groupName, date, timeSlot) => {
    const formattedDate = switchDateFormat(date)
    // Returns array ordered by inmate/cell or name, then start time
    const data = await elite2Api.getHouseblockList(context, agencyId, groupName, formattedDate, timeSlot)

    const offenderNumbers = distinct(data.map(offender => offender.offenderNo))
    const externalEventsForOffenders = await getExternalEventsForOffenders(elite2Api, context, {
      offenderNumbers,
      formattedDate,
      agencyId,
    })

    log.info(data, 'getHouseblockList data received')

    const offendersMap = data.reduce((offenders, event) => {
      const { releaseScheduled, courtEvents, scheduledTransfers, alertFlags, cata } = externalEventsForOffenders.get(
        event.offenderNo
      )

      const offenderData = offenders[event.offenderNo] || {
        offenderNo: event.offenderNo,
        others: [],
        releaseScheduled,
        courtEvents,
        scheduledTransfers,
        alertFlags,
        cata,
      }

      const updatedEntry = {
        [event.offenderNo]: shouldPromoteToMainActivity(offenderData, event)
          ? promoteToMainActivity(offenderData, event)
          : addToOtherActivities(offenderData, event),
      }

      return {
        ...offenders,
        ...updatedEntry,
      }
    }, {})

    return Object.keys(offendersMap).map(offenderNo => ({
      offenderNo,
      ...offendersMap[offenderNo],
    }))
  }

  return {
    getHouseblockList,
  }
}

module.exports = { getHouseblockListFactory }
