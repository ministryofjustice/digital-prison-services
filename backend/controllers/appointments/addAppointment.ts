import moment from 'moment'
import { properCaseName, formatName } from '../../utils'
import { buildDateTime, formatDate, DAY_MONTH_YEAR } from '../../../common/dateHelpers'
import { repeatTypes, endRecurringEndingDate, validateComments } from '../../shared/appointmentConstants'

export type PrePopulatedData = {
  offenderEvents?: string[]
  locationName?: string
  locationEvents?: string[]
}

export const validateDate = (date, errors) => {
  const now = moment()
  if (!date) errors.push({ text: 'Select the appointment date', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR).isValid())
    errors.push({ text: 'Enter the date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })
}

export const validateStartEndTime = (date, startTime, endTime, errors) => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTimeDuration = moment.duration(now.diff(startTime))
  const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

  if (!startTime) errors.push({ text: 'Select the appointment start time', href: '#start-time-hours' })

  if (isToday && startTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select an appointment start time that is not in the past', href: '#start-time-hours' })

  if (endTime && endTimeDuration.asMinutes() > 1) {
    errors.push({ text: 'Select an appointment end time that is not in the past', href: '#end-time-hours' })
  }
}

export const getValidationMessages = (fields) => {
  const { appointmentType, location, date, startTime, endTime, comments, recurring, repeats, times } = fields
  const errors = []

  if (!appointmentType) errors.push({ text: 'Select the type of appointment', href: '#appointment-type' })

  if (!location) errors.push({ text: 'Select the location', href: '#location' })

  validateDate(date, errors)
  validateStartEndTime(date, startTime, endTime, errors)

  // Video link appointments require an end time so we can show availability
  if (appointmentType === 'VLB' && !endTime)
    errors.push({ text: 'Select an appointment end time', href: '#end-time-hours' })

  validateComments(comments, errors)

  if (!recurring) errors.push({ href: '#recurring', text: 'Select yes if this is a recurring appointment' })

  if (recurring === 'yes' && !repeats)
    errors.push({ href: '#repeats', text: 'Select when you want the appointment to repeat' })

  if (recurring === 'yes') {
    if (Number(times) <= 0 || !Number(times))
      errors.push({ href: '#times', text: 'Enter how many appointments you want to add' })

    if (repeats && times) {
      const { recurringStartTime, endOfPeriod } = endRecurringEndingDate({ date, startTime, repeats, times })

      if (endOfPeriod && endOfPeriod.isSameOrAfter(recurringStartTime.startOf('day').add(1, 'years'))) {
        errors.push({
          href: '#times',
          text: 'Select fewer number of appointments - you can only add them for a maximum of 1 year',
        })
      }
    }

    if (repeats === 'WEEKDAYS') {
      const SATURDAY = 6
      const SUNDAY = 0
      if (moment(date, DAY_MONTH_YEAR).day() === SATURDAY || moment(date, DAY_MONTH_YEAR).day() === SUNDAY) {
        errors.push({
          href: '#date',
          text: 'The date must be a week day',
        })
      }
    }
  }

  return errors
}

export const addAppointmentFactory = (
  appointmentsService,
  systemOauthClient,
  existingEventsService,
  prisonApi,
  whereaboutsApi,
  _logError
): { index; post } => {
  const createAppointments = ({
    locals,
    comments,
    location,
    appointmentType,
    startTime,
    endTime,
    bookingId,
    recurring,
    repeats,
    times,
  }) => {
    const appointmentDefaults = {
      comment: comments,
      locationId: Number(location),
      appointmentType,
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
    }

    const request = {
      ...appointmentDefaults,
      bookingId,
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count: times,
            }
          : undefined,
    }

    return whereaboutsApi.createAppointment(locals, request)
  }
  const getAppointmentTypesAndLocations = async (locals, context, prisonerAgencyId) => {
    const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
      locals,
      context,
      prisonerAgencyId
    )

    return {
      appointmentTypes,
      appointmentLocations: locationTypes,
    }
  }
  const renderTemplate = async (req, res, pageData) => {
    const { formValues } = pageData || {}
    const { offenderNo } = req.params

    try {
      const prePopulatedData: PrePopulatedData = {}
      const { firstName, lastName, bookingId, agencyId } = await prisonApi.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
      const context = await systemOauthClient.getClientCredentialsTokens()
      const { appointmentTypes, appointmentLocations } = await getAppointmentTypesAndLocations(
        res.locals,
        context,
        agencyId
      )

      if (formValues && formValues.date) {
        prePopulatedData.offenderEvents = await existingEventsService.getExistingEventsForOffender(
          res.locals,
          agencyId,
          formValues.date,
          offenderNo
        )
      }

      if (formValues && formValues.appointmentType === 'VLB' && formValues.location && formValues.date) {
        const [locationDetails, locationEvents] = await Promise.all([
          prisonApi.getLocation(res.locals, formValues.location),
          existingEventsService.getExistingEventsForLocation(
            res.locals,
            agencyId,
            formValues.location,
            formValues.date
          ),
        ])

        prePopulatedData.locationName = locationDetails.userDescription
        prePopulatedData.locationEvents = locationEvents
      }
      return res.render('addAppointment/addAppointment.njk', {
        ...pageData,
        ...prePopulatedData,
        offenderNo,
        offenderName,
        firstName: properCaseName(firstName),
        lastName: properCaseName(lastName),
        appointmentTypes,
        appointmentLocations,
        repeatTypes,
        bookingId,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  const index = async (req, res) => renderTemplate(req, res, {})

  const post = async (req, res) => {
    const { offenderNo } = req.params

    const {
      appointmentType,
      location,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      recurring,
      repeats,
      times,
      comments,
      bookingId,
    } = req.body

    const startTime = buildDateTime({
      date,
      hours: startTimeHours,
      minutes: startTimeMinutes,
    })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

    const errors = [
      ...getValidationMessages({
        appointmentType,
        location,
        date,
        startTime,
        endTime,
        comments,
        times,
        repeats,
        recurring,
      }),
    ]

    if (errors.length > 0) {
      const { endOfPeriod } = endRecurringEndingDate({ date, startTime, repeats, times })

      const offenderDetails = await prisonApi.getDetails(res.locals, offenderNo)

      const [locationDetails, locationEvents] = (location &&
        (await Promise.all([
          prisonApi.getLocation(res.locals, Number(location)),
          existingEventsService.getExistingEventsForLocation(
            res.locals,
            offenderDetails.agencyId,
            Number(location),
            date
          ),
        ]))) || [{}, []]

      return renderTemplate(req, res, {
        errors,
        prisonerName: formatName(offenderDetails.firstName, offenderDetails.lastName),
        date: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
        locationName: locationDetails.userDescription,
        locationEvents,
        formValues: { ...req.body, location: Number(location) },
        endOfPeriod: endOfPeriod && endOfPeriod.format('dddd D MMMM YYYY'),
      })
    }

    const appointmentDefaults = {
      comment: comments,
      locationId: Number(location),
      appointmentType,
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
    }

    try {
      req.flash('appointmentDetails', {
        recurring,
        times,
        repeats,
        ...appointmentDefaults,
        bookingId,
      })

      await createAppointments({
        locals: res.locals,
        comments,
        location,
        appointmentType,
        startTime,
        endTime,
        bookingId,
        repeats,
        recurring,
        times,
      })

      return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  return { index, post }
}

export default {
  addAppointmentFactory,
}
