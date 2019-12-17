const { switchDateFormat, getTime, sortByDateTime } = require('../utils')

module.exports = elite2Api => {
  const getExistingEventsForOffender = async (context, agencyId, date, offenderNo) => {
    const formattedDate = switchDateFormat(date)
    const searchCriteria = { agencyId, date: formattedDate, offenderNumbers: [offenderNo] }

    const getEventDescription = ({ eventDescription, eventLocation, comment }) => {
      const description = eventDescription === 'Prison Activities' ? 'Activity' : eventDescription
      const locationString = eventLocation ? `${eventLocation} -` : ''
      const descriptionString = comment ? `${description} - ${comment}` : eventDescription

      return `${locationString} ${descriptionString}`
    }

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
        .map(event => ({
          ...event,
          startTime: getTime(event.startTime),
          endTime: event.endTime && getTime(event.endTime),
          eventDescription: getEventDescription(event),
        }))

      if (hasCourtVisit) formattedEvents.unshift({ eventDescription: '**Court visit scheduled**' })

      if (isReleaseDate) formattedEvents.unshift({ eventDescription: '**Due for release**' })

      return formattedEvents
    } catch (error) {
      return error
    }
  }

  return { getExistingEventsForOffender }
}
