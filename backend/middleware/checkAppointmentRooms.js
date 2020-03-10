const { DATE_TIME_FORMAT_SPEC, buildDateTime } = require('../../src/dateHelpers')

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

  return appointmentDetails.reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )
}

module.exports = (existingEventsService, availableSlotsService, logError) => async (req, res, next) => {
  const appointmentDetails = unpackAppointmentDetails(req)
  const {
    date,
    preAppointmentRequired,
    postAppointmentRequired,
    startTimeHours,
    startTimeMinutes,
    endTimeHours,
    endTimeMinutes,
  } = appointmentDetails
  const { selectPreAppointmentLocation, selectMainAppointmentLocation, selectPostAppointmentLocation } = req.body
  const { offenderNo, agencyId } = req.params

  const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
  const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

  try {
    const { mainLocations, preLocations, postLocations } = await existingEventsService.getAvailableLocationsForVLB(
      res.locals,
      {
        agencyId,
        startTime,
        endTime,
        date,
        preAppointmentRequired,
        postAppointmentRequired,
      }
    )

    const preAppointmentLocationsNotValid = Boolean(preAppointmentRequired === 'yes' && preLocations.length < 2)
    const postAppointmentLocationsNotValid = Boolean(postAppointmentRequired === 'yes' && postLocations.length < 2)
    const noAvailabilityForGivenTime = Boolean(
      !mainLocations.length || preAppointmentLocationsNotValid || postAppointmentLocationsNotValid
    )
    if (noAvailabilityForGivenTime) {
      const start =
        preAppointmentRequired === 'yes'
          ? startTime.subtract(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)
          : startTime.format(DATE_TIME_FORMAT_SPEC)

      const end =
        postAppointmentRequired === 'yes'
          ? endTime.add(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)
          : endTime.format(DATE_TIME_FORMAT_SPEC)

      const availableRooms = await availableSlotsService.getAvailableRooms(res.locals, {
        startTime: start,
        endTime: end,
        agencyId,
      })

      const atLeastTwoRoomsNeeded = Boolean(preAppointmentRequired === 'yes' || postAppointmentRequired === 'yes')
      const minRooms = atLeastTwoRoomsNeeded ? 2 : 1

      if (availableRooms.length < minRooms) {
        return res.render('noAppointmentsForWholeDay.njk', {
          date: startTime.format('dddd D MMMM YYYY'),
          continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
          homeUrl: '/videolink',
        })
      }

      if (availableRooms.length >= minRooms) {
        return res.render('noAppointmentsForDateTime.njk', {
          date: startTime.format('dddd D MMMM YYYY'),
          startTime: startTime.format('HH:mm'),
          endTime: endTime.format('HH:mm'),
          continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
          homeUrl: '/videolink',
        })
      }
    }

    const preLocationAvailableOrNotRequired = selectPreAppointmentLocation
      ? preLocations.some(room => room.value === Number(selectPreAppointmentLocation))
      : true

    const mainLocationAvailableOrNotRequired = selectMainAppointmentLocation
      ? mainLocations.some(room => room.value === Number(selectMainAppointmentLocation))
      : true

    const postLocationAvailableOrNotRequired = selectPostAppointmentLocation
      ? postLocations.some(room => room.value === Number(selectPostAppointmentLocation))
      : true

    if (
      !preLocationAvailableOrNotRequired ||
      !mainLocationAvailableOrNotRequired ||
      !postLocationAvailableOrNotRequired
    ) {
      req.flash('appointmentDetails', appointmentDetails)
      return res.render('appointmentRoomNoLongerAvailable.njk', {
        continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`,
      })
    }

    req.flash('appointmentDetails', appointmentDetails)
    return next()
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'message')
    return res.render('error.njk', { url: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/` })
  }
}
