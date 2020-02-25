const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')

const defaultOptions = {
  startOfDay: 8,
  endOfDay: 18,
  byMinutes: 5,
}

const getDiffInMinutes = (startTime, endTime) => {
  const duration = moment.duration(endTime.diff(startTime))
  return duration.asMinutes()
}

const sortByStartTime = (a, b) => a.startTime.diff(b.startTime)

module.exports = (
  { appointmentsService, existingEventsService },
  { startOfDay, endOfDay, byMinutes } = defaultOptions
) => {
  const breakDayIntoSlots = ({ date }) => {
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
    const numberOfSlots = Math.floor(totalMinutes / byMinutes)

    return [...Array(numberOfSlots).keys()]
      .map(index => {
        const start = moment(startTime).add(index * byMinutes, 'minute')
        const end = moment(start).add(byMinutes, 'minute')

        return {
          startTime: start,
          endTime: end,
        }
      })
      .sort(sortByStartTime)
  }

  const groupIntoPairs = slots => slots.map((slot, index) => [slot, slots[index + 1]])

  const joinSlots = freeSlots => {
    return groupIntoPairs(freeSlots.sort(sortByStartTime)).reduce(
      (result, currentTimeSlotPair) => {
        const currentTimeSLot = currentTimeSlotPair[0]
        const nextTimeSlot = currentTimeSlotPair[1]
        const { connectedSlots, slotIndex, streak } = result

        if (!nextTimeSlot) {
          const newSlotIndex = result.streak ? result.slotIndex : result.slotIndex + 1
          return {
            ...result,
            connectedSlots: {
              ...connectedSlots,
              [newSlotIndex]: [currentTimeSLot, ...connectedSlots[newSlotIndex]],
            },
          }
        }

        const isConnected = getDiffInMinutes(currentTimeSLot.endTime, nextTimeSlot.startTime) === 0
        const newSlotIndex = streak && isConnected ? slotIndex : slotIndex + 1

        if (isConnected) {
          return {
            ...result,
            streak: true,
            slotIndex: newSlotIndex,
            connectedSlots: {
              ...connectedSlots,
              [newSlotIndex]: [
                { startTime: currentTimeSLot.startTime, endTime: nextTimeSlot.endTime },
                ...connectedSlots[newSlotIndex],
              ],
            },
          }
        }

        return {
          ...result,
          streak: false,
          slotIndex: newSlotIndex,
          connectedSlots: {
            ...connectedSlots,
            [newSlotIndex]: [{ currentTimeSLot, ...connectedSlots[newSlotIndex] }],
          },
        }
      },
      { connectedSlots: { 0: [] }, slotIndex: 0, streak: true }
    ).connectedSlots
  }

  const getAvailableSlots = ({ bookedSlots, date }) => {
    const dayIntoSlots = breakDayIntoSlots({ date })

    const freeSlots = dayIntoSlots.filter(day => {
      const overlappingSlots = bookedSlots.filter(bookedSlot => {
        const bookedStartTime = moment(bookedSlot.startTime, DATE_TIME_FORMAT_SPEC)
        const bookedEndTime = moment(bookedSlot.endTime, DATE_TIME_FORMAT_SPEC)

        return (
          moment(bookedStartTime).isSameOrBefore(day.endTime, 'minute') &&
          moment(day.startTime).isSameOrBefore(bookedEndTime, 'minute')
        )
      })

      return overlappingSlots.length === 0
    })

    const joinedSlots = joinSlots(freeSlots)

    return Object.keys(joinedSlots).map(entry => {
      const times = joinedSlots[entry].sort(sortByStartTime)
      return {
        startTime: times[0].startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: times.pop().endTime.format(DATE_TIME_FORMAT_SPEC),
      }
    })
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

  const getAvailableSlotsByMinLength = ({ bookedSlots, date, minutesNeeded }) =>
    getAvailableSlots({ bookedSlots, date })
      .map(slot => ({
        ...slot,
        lengthInMinutes: moment.duration(moment(slot.endTime).diff(moment(slot.startTime))).asMinutes(),
      }))
      .filter(slot => slot.lengthInMinutes >= minutesNeeded)
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))

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

    const timeSlots = getAvailableSlotsByMinLength({
      bookedSlots: eventsAtLocations,
      date: date.format(DATE_ONLY_FORMAT_SPEC),
      minutesNeeded,
    })

    return getAvailableLocationsForSlots(context, { timeSlots, locations, eventsAtLocations })
  }

  return {
    getAvailableRooms,
    getAvailableSlots,
    breakDayIntoSlots,
    getAvailableSlotsByMinLength,
    getAvailableLocationsForSlots,
  }
}
