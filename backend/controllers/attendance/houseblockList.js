/* eslint-disable no-lonely-if */
const moment = require('moment')
const getExternalEventsForOffenders = require('../../shared/getExternalEventsForOffenders')
const log = require('../../log')
const { switchDateFormat, distinct } = require('../../utils')
const { absentReasonMapper } = require('../../mappers')

function safeTimeCompare(a, b) {
  if (a && b) return moment(b).isBefore(a)
  return !a
}

const shouldPromoteToMainActivity = (offender, newActivity) => {
  if (newActivity.eventType !== 'PRISON_ACT') return false
  const mainActivity = offender.activities.find(act => act.mainActivity)
  if (!mainActivity) return true

  if (mainActivity.payRate && !newActivity.payRate) {
    return false
  }

  if (!mainActivity.payRate && newActivity.payRate) {
    return true
  }
  // Multiple paid activities, or neither paid - make the earliest starting one the main one
  return Boolean(safeTimeCompare(mainActivity.startTime, newActivity.startTime))
}

const isStayingOnWing = activities => {
  const stayingOnWingCodes = ['WOW', 'STAYONWING', 'UNEMPLOYED', 'RETIRED']
  const leavingWingActivities = activities.filter(activity => !stayingOnWingCodes.includes(activity.locationCode))

  return leavingWingActivities.length === 0
}

const promoteToMainActivity = (offender, activity) => {
  const newMainActivity = { ...activity, mainActivity: true }
  const oldMainActivity = offender.activities.find(act => act.mainActivity)
  const otherActivities = offender.activities.filter(act => act && !act.mainActivity)

  if (oldMainActivity) oldMainActivity.mainActivity = false

  const activities = oldMainActivity
    ? [newMainActivity, ...otherActivities, oldMainActivity]
    : [newMainActivity, ...otherActivities]

  return {
    ...offender,
    activities,
    stayingOnWing: isStayingOnWing(activities),
  }
}

const addToActivities = (offender, activity) => ({
  ...offender,
  activities: [...offender.activities, activity],
  stayingOnWing: isStayingOnWing([...offender.activities, activity]),
})

const getHouseblockListFactory = (elite2Api, whereaboutsApi) => {
  const getHouseblockList = async (context, agencyId, groupName, date, timeSlot, wingStatus) => {
    const locations = await whereaboutsApi.getAgencyGroupLocations(context, agencyId, groupName)
    if (locations.length === 0) {
      return []
    }

    const locationIds = locations.map(location => location.locationId)
    const formattedDate = switchDateFormat(date)
    // Returns array ordered by inmate/cell or name, then start time
    const data = await elite2Api.getHouseblockList(context, agencyId, locationIds, formattedDate, timeSlot)

    const offenderNumbers = distinct(data.map(offender => offender.offenderNo))

    const externalEventsForOffenders = await getExternalEventsForOffenders(elite2Api, context, {
      offenderNumbers,
      formattedDate,
      agencyId,
    })

    log.info(data.size, 'getHouseblockList data received')

    const bookings = Array.from(new Set(data.map(event => event.bookingId)))
    const shouldGetAttendanceForBookings = bookings.length > 0
    const absentReasons = await whereaboutsApi.getAbsenceReasons(context)
    const toAbsentReason = absentReasonMapper(absentReasons)

    const attendanceInformation = shouldGetAttendanceForBookings
      ? await whereaboutsApi.getAttendanceForBookings(context, {
          agencyId,
          bookings,
          date: formattedDate,
          period: timeSlot,
        })
      : []

    const offendersMap = data.reduce((offenders, event) => {
      const {
        releaseScheduled,
        courtEvents,
        scheduledTransfers,
        alertFlags,
        category,
      } = externalEventsForOffenders.get(event.offenderNo)

      const offenderData = offenders[event.offenderNo] || {
        offenderNo: event.offenderNo,
        bookingId: event.bookingId,
        firstName: event.firstName,
        lastName: event.lastName,
        cellLocation: event.cellLocation,
        eventId: event.eventId,
        eventLocationId: event.eventLocationId,
        activities: [],
        releaseScheduled,
        courtEvents,
        scheduledTransfers,
        alertFlags,
        category,
      }

      const attendanceInfo =
        attendanceInformation.attendances &&
        attendanceInformation.attendances.find(
          activityWithAttendance =>
            event.bookingId === activityWithAttendance.bookingId &&
            event.eventId === activityWithAttendance.eventId &&
            event.eventLocationId === activityWithAttendance.eventLocationId
        )

      const { id, absentReason, comments, locked, paid, attended } = attendanceInfo || {}

      const eventWithAttendance = {
        ...event,
        attendanceInfo: {
          id,
          absentReason: toAbsentReason && toAbsentReason(absentReason),
          comments,
          locked,
          paid,
        },
      }

      if (attendanceInfo) {
        if (absentReason) eventWithAttendance.attendanceInfo.other = true
        if (attended && paid) eventWithAttendance.attendanceInfo.pay = true
      }

      const offenderWithUpdatedActivities = {
        [event.offenderNo]: shouldPromoteToMainActivity(offenderData, eventWithAttendance)
          ? promoteToMainActivity(offenderData, eventWithAttendance)
          : addToActivities(offenderData, eventWithAttendance),
      }

      return {
        ...offenders,
        ...offenderWithUpdatedActivities,
      }
    }, {})

    const response = Object.keys(offendersMap).map(offenderNo => ({
      offenderNo,
      ...offendersMap[offenderNo],
    }))

    if (wingStatus === 'staying') return response.filter(offender => offender.stayingOnWing)

    if (wingStatus === 'leaving') return response.filter(offender => !offender.stayingOnWing)

    return response
  }

  return {
    getHouseblockList,
  }
}

module.exports = { getHouseblockListFactory }
