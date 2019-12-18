const moment = require('moment')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

const { properCaseName } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')
const { DATE_TIME_FORMAT_SPEC, Time } = require('../../src/dateHelpers')
const { endRecurringEndingDate, repeatTypes } = require('../shared/appointmentConstants')

const confirmAppointmentFactory = ({ elite2Api, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )

      const appointmentDetails = req.flash('appointmentDetails')
      if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

      const {
        locationId,
        appointmentType,
        startTime,
        endTime,
        comment,
        recurring,
        times,
        repeats,
      } = appointmentDetails[0]

      const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const { firstName, lastName, assignedLivingUnitDesc } = await elite2Api.getDetails(res.locals, offenderNo)

      req.flash('appointmentSlipsData', {
        appointmentDetails: {
          startTime,
          endTime,
          comments: comment,
          appointmentTypeDescription,
          locationDescription,
        },
        prisonersListed: [
          {
            firstName: properCaseName(firstName),
            lastName: properCaseName(lastName),
            offenderNo,
            startTime,
            endTime,
            assignedLivingUnitDesc,
          },
        ],
      })

      const recurringInformation = recurring === 'yes' && {
        howOften: repeatTypes.find(repeat => repeat.value === repeats).text,
        numberOfAppointments: times,
        endDate: endRecurringEndingDate({ startTime, repeats, times }).endOfPeriod.format('dddd D MMMM YYYY'),
      }

      const title = recurring === 'yes' ? 'Appointments booked' : 'Appointment booked'

      res.render('confirmAppointments.njk', {
        title,
        addAppointmentsLink: `/offenders/${offenderNo}/add-appointment`,
        prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
        details: {
          prisonerName: `${properCaseName(lastName)}, ${properCaseName(firstName)} (${offenderNo})`,
          appointmentType: appointmentTypeDescription,
          location: locationDescription,
          date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('dddd D MMMM YYYY'),
          startTime: Time(startTime),
          endTime: endTime && Time(endTime),
          comment,
          recurring: properCaseName(recurring),
          ...recurringInformation,
        },
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk')
    }
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}
