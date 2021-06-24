const moment = require('moment')
const { endRecurringEndingDate } = require('../shared/appointmentConstants')
const { getDate } = require('../utils')

const repeatTypeDescriptions = [
  { value: 'WEEKLY', text: 'weekly' },
  { value: 'DAILY', text: 'daily' },
  { value: 'WEEKDAYS', text: 'Monday to Friday' },
  { value: 'MONTHLY', text: 'monthly' },
  { value: 'FORTNIGHTLY', text: 'every 2 weeks' },
]

const deleteSingleAppointment = async (res, whereaboutsApi, id) => {
  try {
    await whereaboutsApi.deleteAppointment(res.locals, id)
    return res.redirect(`/appointment-details/deleted?multipleDeleted=false`)
  } catch (error) {
    if (error?.response?.status === 404) {
      // Already deleted - ignore
      return res.redirect(`/appointment-details/deleted?multipleDeleted=false`)
    }
    res.locals.redirectUrl = `/appointment-details/${id}`
    throw error
  }
}

const deleteRecurringAppointmentSequence = async (res, whereaboutsApi, id) => {
  try {
    await whereaboutsApi.deleteRecurringAppointmentSequence(res.locals, id)
    return res.redirect(`/appointment-details/deleted?multipleDeleted=true`)
  } catch (error) {
    if (error?.response?.status === 404) {
      // Already deleted - ignore
      return res.redirect(`/appointment-details/deleted?multipleDeleted=true`)
    }
    res.locals.redirectUrl = `/appointment-details/${id}`
    throw error
  }
}

module.exports = ({ whereaboutsApi }) => {
  const index = async (req, res) => {
    try {
      const { id } = req.params

      const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

      const lastAppointmentDate = endRecurringEndingDate({
        date: moment(appointmentDetails.recurring.startTime).format('DD/MM/YYYY'),
        repeats: appointmentDetails.recurring.repeatPeriod,
        times: appointmentDetails.recurring.count,
      })

      const recurringFrequencyDescription = repeatTypeDescriptions.find(
        (repeat) => repeat.value === appointmentDetails.recurring.repeatPeriod
      ).text

      return res.render('appointmentDeleteRecurringBookings', {
        errors: req.flash('deletionErrors'),
        recurringAppointmentId: appointmentDetails.recurring.id,
        recurringFrequencyDescription,
        lastAppointment: getDate(lastAppointmentDate.endOfPeriod, 'D MMMM YYYY'),
      })
    } catch (error) {
      res.locals.redirectUrl = `/view-all-appointments`
      throw error
    }
  }

  const post = async (req, res) => {
    const { deleteRecurringSequence, recurringAppointmentId } = req.body
    const { id } = req.params

    if (!deleteRecurringSequence) {
      const errors = []
      errors.push({
        text: 'Select yes if you want to delete all of these appointments',
        href: '#deleteRecurringSequence',
      })

      req.flash('deletionErrors', errors)
      return res.redirect(req.originalUrl)
    }

    if (deleteRecurringSequence === 'no') {
      return deleteSingleAppointment(res, whereaboutsApi, id)
    }

    return deleteRecurringAppointmentSequence(res, whereaboutsApi, recurringAppointmentId)
  }

  return { index, post }
}
