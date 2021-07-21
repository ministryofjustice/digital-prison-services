import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, buildDateTime } from '../../../common/dateHelpers'
import { capitalize } from '../../utils'
import { repeatTypes, getValidationMessages, endRecurringEndingDate } from '../../shared/appointmentConstants'

const setSelected = (value, items) =>
  items.map((item) =>
    item.value === value
      ? {
          ...item,
          selected: true,
        }
      : item
  )

const extractHoursMinutes = (dateTime) => {
  if (!dateTime) return { hours: '', minutes: '' }
  const instant = moment(dateTime, DATE_TIME_FORMAT_SPEC)
  return {
    hours: instant.format('HH'),
    minutes: instant.format('mm'),
  }
}

export const bulkAppointmentsAddDetailsFactory = (appointmentsService) => {
  const getAppointmentTypesAndLocations = async (locals, activeCaseLoadId) => {
    const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
      locals,
      activeCaseLoadId
    )

    return {
      appointmentTypes,
      locations: locationTypes,
    }
  }

  async function index(req, res) {
    const { activeCaseLoadId } = req.session.userDetails
    const { appointmentTypes, locations } = await getAppointmentTypesAndLocations(res.locals, activeCaseLoadId)

    const {
      appointmentType,
      location,
      date,
      startTime,
      endTime,
      sameTimeAppointments,
      comments,
      recurring,
      times,
      repeats,
    } = req.session.data || {}

    const startTimeHoursMinutes = extractHoursMinutes(startTime)
    const endTimeHoursMinutes = extractHoursMinutes(endTime)

    res.render('bulkAppointmentsAddDetails.njk', {
      title: 'Add appointment details',
      appointmentTypes,
      locations,
      appointmentType,
      location,
      comments,
      date,
      startTimeHours: startTimeHoursMinutes.hours,
      startTimeMinutes: startTimeHoursMinutes.minutes,
      endTimeHours: endTimeHoursMinutes.hours,
      endTimeMinutes: endTimeHoursMinutes.minutes,
      sameTimeAppointments,
      repeatTypes,
      recurring,
      repeats,
      times,
    })
  }

  async function post(req, res) {
    const { activeCaseLoadId } = req.session.userDetails

    const {
      appointmentType,
      location,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      sameTimeAppointments,
      comments,
      times,
      repeats,
      recurring,
    } = req.body || {}

    const { appointmentTypes, locations } = await getAppointmentTypesAndLocations(res.locals, activeCaseLoadId)

    const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

    const appointmentTypeDetails = appointmentType && appointmentTypes.find((type) => type.value === appointmentType)
    const locationDetails = location && locations.find((type) => type.value === Number(location))

    const errors = [
      ...getValidationMessages({
        appointmentType,
        location,
        date,
        startTime,
        endTime,
        sameTimeAppointments,
        comments,
        times,
        repeats,
        recurring,
      }),
    ]

    if (!sameTimeAppointments)
      errors.push({ text: 'Select yes if the appointments all have the same time', href: '#same-time-appointments' })

    const { endOfPeriod } = endRecurringEndingDate({ date, startTime, repeats, times })

    if (!errors.length) {
      const timeInfo = sameTimeAppointments === 'yes' && {
        startTime: startTime && startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
      }

      const recurringInfo = recurring === 'yes' && {
        times,
        repeats,
        repeatsText: capitalize(repeats),
        endOfPeriod: endOfPeriod && endOfPeriod.format('dddd D MMMM YYYY'),
      }

      req.session.data = {
        appointmentType,
        appointmentTypeDescription: appointmentTypeDetails && appointmentTypeDetails.text,
        location: Number(location),
        locationDescription: locationDetails && locationDetails.text,
        date,
        sameTimeAppointments,
        comments,
        recurring,
        ...timeInfo,
        ...recurringInfo,
      }
      return res.redirect('/bulk-appointments/upload-file')
    }

    return res.render('bulkAppointmentsAddDetails.njk', {
      errors,
      date,
      sameTimeAppointments,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      comments,
      appointmentTypes: setSelected(appointmentType, appointmentTypes),
      locations: setSelected(Number(location), locations),
      appointmentType,
      location: Number(location),
      repeatTypes,
      repeats,
      times: Number(times),
      recurring,
      endOfPeriod: endOfPeriod && endOfPeriod.format('dddd D MMMM YYYY'),
    })
  }

  return {
    index,
    post,
  }
}

export default {
  bulkAppointmentsAddDetailsFactory,
}
