/* eslint-disable no-lonely-if */
const moment = require('moment')
const getExternalEventsForOffenders = require('../shared/getExternalEventsForOffenders')
const log = require('../log')
const { switchDateFormat, distinct } = require('../utils')

function addToOthers(currentRow, event) {
  if (!currentRow.others) {
    // set array of non-paid activities, appointments or visits
    currentRow.others = [event]
  } else {
    currentRow.others.push(event)
  }
}

function safeTimeCompare(a, b) {
  if (a && b) return moment(b).isBefore(a)
  return !a
}

function handleMultipleActivities(currentRow, currentActivity) {
  if (!currentRow.activity.payRate && currentActivity.payRate) {
    // Make current activity the main activity
    addToOthers(currentRow, currentRow.activity)
    currentRow.activity = currentActivity
  } else if (currentRow.activity.payRate && !currentActivity.payRate) {
    // current activity is an 'other'
    addToOthers(currentRow, currentActivity)
  }
  // Multiple paid activities, or neither paid - make the earliest starting one the main one
  else if (safeTimeCompare(currentRow.activity.startTime, currentActivity.startTime)) {
    addToOthers(currentRow, currentRow.activity)
    currentRow.activity = currentActivity
  } else {
    // current activity starts later so 'other'
    addToOthers(currentRow, currentActivity)
  }
}

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
    const rows = []
    let i = -1
    let lastOffenderNo = ''

    data.forEach(event => {
      if (event.offenderNo !== lastOffenderNo) {
        i += 1
        lastOffenderNo = event.offenderNo
        rows[i] = {}
      }

      const currentRow = rows[i]
      if (event.eventType === 'PRISON_ACT') {
        if (!currentRow.activity) {
          // 1st activity found for this offender
          currentRow.activity = event
        } else {
          handleMultipleActivities(currentRow, event)
        }
      } else {
        addToOthers(currentRow, event)
      }
      const { releaseScheduled, courtEvents, scheduledTransfers } = externalEventsForOffenders.get(event.offenderNo)

      currentRow.releaseScheduled = releaseScheduled
      currentRow.courtEvents = courtEvents
      currentRow.scheduledTransfers = scheduledTransfers
    })

    return rows
  }

  return {
    getHouseblockList,
  }
}

module.exports = { getHouseblockListFactory }
