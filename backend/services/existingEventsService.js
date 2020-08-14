const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')
const { switchDateFormat, getTime, sortByDateTime } = require('../utils')
const { appointmentsServiceFactory } = require('./appointmentsService')

const getEventDescription = ({ eventDescription, eventLocation, comment }) => {
  const description = eventDescription === 'Prison Activities' ? 'Activity' : eventDescription
  const locationString = eventLocation ? `${eventLocation} -` : ''
  const descriptionString = comment ? `${description} - ${comment}` : eventDescription

  return `${locationString} ${descriptionString}`
}

const toEvent = event => ({
  ...event,
  startTime: getTime(event.startTime),
  endTime: event.endTime && getTime(event.endTime),
  start: event.startTime,
  end: event.endTime,
  eventDescription: getEventDescription(event),
})

module.exports = elite2Api => {
  const getExistingEventsForOffender = async (context, agencyId, date, offenderNo) => {
    const formattedDate = switchDateFormat(date)
    const searchCriteria = { agencyId, date: formattedDate, offenderNumbers: [offenderNo] }

    try {
      const [sentenceData, courtEvents, ...rest] = await Promise.all([
        elite2Api.getSentenceData(context, searchCriteria.offenderNumbers),
        elite2Api.getCourtEvents(context, searchCriteria),
        elite2Api.getVisits(context, searchCriteria),
        elite2Api.getAppointments(context, searchCriteria),
        elite2Api.getExternalTransfers(context, searchCriteria),
        elite2Api.getActivities(context, searchCriteria),
      ])

      const hasCourtVisit = courtEvents.length && courtEvents.filter(event => event.eventStatus === 'SCH')

      const isReleaseDate = sentenceData.length && sentenceData[0].sentenceDetail.releaseDate === formattedDate

      const otherEvents = rest.reduce((flattenedEvents, event) => flattenedEvents.concat(event), [])

      const formattedEvents = otherEvents
        .sort((left, right) => sortByDateTime(left.startTime, right.startTime))
        .map(toEvent)

      if (hasCourtVisit) formattedEvents.unshift({ eventDescription: '**Court visit scheduled**' })

      if (isReleaseDate) formattedEvents.unshift({ eventDescription: '**Due for release**' })

      return formattedEvents
    } catch (error) {
      return error
    }
  }

  const getExistingEventsForLocation = async (context, agencyId, locationId, date) => {
    const formattedDate = switchDateFormat(date)
    const searchCriteria = { agencyId, date: formattedDate, locationId }

    try {
      const eventsAtLocationByUsage = await Promise.all([
        elite2Api.getActivitiesAtLocation(context, searchCriteria),
        elite2Api.getActivityList(context, { ...searchCriteria, usage: 'VISIT' }),
        elite2Api.getActivityList(context, { ...searchCriteria, usage: 'APP' }),
      ]).then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))

      return eventsAtLocationByUsage.sort((left, right) => sortByDateTime(left.startTime, right.startTime)).map(toEvent)
    } catch (error) {
      return error
    }
  }

  const getAppointmentsAtLocationEnhanceWithLocationId = (context, agency, locationId, date) =>
    new Promise((resolve, reject) => {
      elite2Api
        .getActivityList(context, { agencyId: agency, date: switchDateFormat(date), locationId, usage: 'APP' })
        .then(response => {
          resolve(response.map(event => toEvent({ ...event, locationId })))
        })
        .catch(reject)
    })

  const getAppointmentsAtLocations = async (context, { agency, date, locations }) => {
    return (await Promise.all(
      locations.map(location => getAppointmentsAtLocationEnhanceWithLocationId(context, agency, location.value, date))
    )).reduce((acc, current) => acc.concat(current), [])
  }

  const getAvailableLocations = async (context, { timeSlot, locations, eventsAtLocations }) => {
    const requestedStartTime = moment(timeSlot.startTime, DATE_TIME_FORMAT_SPEC)
    const requestedEndTime = moment(timeSlot.endTime, DATE_TIME_FORMAT_SPEC)

    const findOverlappingSlots = slots =>
      slots.filter(bookedSlot => {
        const bookedStartTime = moment(bookedSlot.start, DATE_TIME_FORMAT_SPEC)
        const bookedEndTime = moment(bookedSlot.end, DATE_TIME_FORMAT_SPEC)

        return (
          moment(bookedStartTime).isSameOrBefore(requestedEndTime, 'minute') &&
          moment(requestedStartTime).isSameOrBefore(bookedEndTime, 'minute')
        )
      })

    const fullyBookedLocations = locations.filter(location => {
      const slots = eventsAtLocations.filter(locationEvent => locationEvent.locationId === location.value)
      return findOverlappingSlots(slots).length > 0
    })

    return locations.filter(location => !fullyBookedLocations.includes(location))
  }

  const getAvailableLocationsForVLB = async (
    context,
    { agencyId, startTime, endTime, date, preAppointmentRequired, postAppointmentRequired }
  ) => {
    const appointmentsService = appointmentsServiceFactory(elite2Api)
    const locations = await appointmentsService.getLocations(context, agencyId, 'VIDE')

    const eventsAtLocations = await getAppointmentsAtLocations(context, {
      agency: agencyId,
      date,
      locations,
    })

    const mainStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
      .add(1, 'minute')
      .format(DATE_TIME_FORMAT_SPEC)
    const mainLocations = await getAvailableLocations(context, {
      timeSlot: { startTime: mainStartTime, endTime },
      locations,
      eventsAtLocations,
    })

    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
      .subtract(20, 'minutes')
      .format(DATE_TIME_FORMAT_SPEC)

    const preLocations =
      preAppointmentRequired === 'yes'
        ? await getAvailableLocations(context, {
            timeSlot: { startTime: preStartTime, endTime: startTime },
            locations,
            eventsAtLocations,
          })
        : []

    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC)
      .add(20, 'minutes')
      .format(DATE_TIME_FORMAT_SPEC)

    const postLocations =
      postAppointmentRequired === 'yes'
        ? await getAvailableLocations(context, {
            timeSlot: { startTime: endTime, endTime: postEndTime },
            locations,
            eventsAtLocations,
          })
        : []

    return { mainLocations, preLocations, postLocations }
  }

  return {
    getExistingEventsForOffender,
    getExistingEventsForLocation,
    getAvailableLocations,
    getAvailableLocationsForVLB,
    getAppointmentsAtLocations,
  }
}
