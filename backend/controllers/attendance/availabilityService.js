const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')

const availabilityServiceFactory = (existingEventsService, appointmentService) => {
  const getEventsAtLocation = (context, agency, locationId, today) =>
    new Promise((resolve, reject) => {
      existingEventsService
        .getExistingEventsForLocation(context, agency, locationId, today)
        .then(response => {
          resolve(
            response.map(entry => ({
              ...entry,
              locationId,
            }))
          )
        })
        .catch(reject)
    })

  const getAvailableLocations = async (context, agency, timeSlot) => {
    const today = moment().format(DAY_MONTH_YEAR)
    const locations = await appointmentService.getLocations(context, agency, 'VIDE')

    const eventsAtLocation = (await Promise.all(
      locations.map(location => getEventsAtLocation(context, agency, location.value, today))
    )).reduce((acc, current) => acc.concat(current), [])

    const startTime = moment(timeSlot.startTime, DATE_TIME_FORMAT_SPEC)
    const endTime = moment(timeSlot.endTime, DATE_TIME_FORMAT_SPEC)

    const locationsWithNothingBooked = locations.filter(location =>
      eventsAtLocation.find(el => el.locationId !== location.value)
    )

    const locationsWithFreeTimeSlots = eventsAtLocation
      .filter(event => {
        const start = moment(event.startTime, DATE_TIME_FORMAT_SPEC)
        const end = moment(event.endTime, DATE_TIME_FORMAT_SPEC)

        return !startTime.isSameOrBefore(end) && !endTime.isSameOrAfter(start)
      })
      .map(event => ({
        ...locations.find(location => location.value === event.locationId),
      }))

    return [...locationsWithNothingBooked, ...locationsWithFreeTimeSlots]
  }

  return {
    getAvailableLocations,
  }
}

module.exports = {
  availabilityServiceFactory,
}
