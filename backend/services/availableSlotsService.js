const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')

const defaultOptions = {
  startOfDay: 8,
  endOfDay: 18,
}

const getDiffInMinutes = (startTime, endTime) => {
  const duration = moment.duration(endTime.diff(startTime))
  return duration.asMinutes()
}

const sortByStartTime = (a, b) => a.startTime.diff(b.startTime)

module.exports = ({ appointmentsService, existingEventsService }, { startOfDay, endOfDay } = defaultOptions) => {
  const breakDayIntoSlots = ({ date, minutesNeeded }) => {
    const startTime = moment(date, DATE_ONLY_FORMAT_SPEC)
      .hour(Number(startOfDay))
      .minute(0)
      .seconds(0)
      .millisecond(0)

    const endTime = moment(date, DATE_ONLY_FORMAT_SPEC)
      .hour(Number(endOfDay))
      .minute(0)
      .seconds(0)
      .millisecond(0)

    const duration = moment.duration(endTime.diff(startTime))
    const totalMinutes = duration.asMinutes()

    const numberOfSlots = Math.floor(totalMinutes / minutesNeeded)

    return [...Array(numberOfSlots).keys()]
      .map(index => {
        const start = moment(startTime).add(index * minutesNeeded, 'minute')
        const end = moment(start).add(minutesNeeded, 'minute')

        return {
          startTime: start,
          endTime: end,
        }
      })
      .sort(sortByStartTime)
  }
  const getAvailableLocationsForSlots = (context, { timeSlots, locations, eventsAtLocations }) => [
    ...new Set(
      timeSlots
        .map(timeSlot => {
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
        })
        .reduce((acc, current) => acc.concat(current), [])
    ),
  ]
  const getAvailableRooms = async (context, { agencyId, startTime, endTime }) => {
    const date = moment(startTime, DATE_TIME_FORMAT_SPEC)

    const locations = await appointmentsService.getLocations(context, agencyId, 'VIDE')
    const eventsAtLocations = await existingEventsService.getAppointmentsAtLocations(context, {
      agency: agencyId,
      date: date.format(DAY_MONTH_YEAR),
      locations,
    })

    const minutesNeeded = getDiffInMinutes(
      moment(startTime, DATE_TIME_FORMAT_SPEC),
      moment(endTime, DATE_TIME_FORMAT_SPEC)
    )

    const timeSlots = breakDayIntoSlots({
      date: date.format(DATE_ONLY_FORMAT_SPEC),
      minutesNeeded,
    })

    return getAvailableLocationsForSlots(context, { timeSlots, locations, eventsAtLocations })
  }

  return {
    getAvailableRooms,
    breakDayIntoSlots,
    getAvailableLocationsForSlots,
  }
}
