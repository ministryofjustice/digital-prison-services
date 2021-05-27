const packAppointmentDetails = (req, details) => {
  req.flash('appointmentDetails', details)
}

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

const clearAppointmentDetails = req => {
  req.flash('appointmentDetails')
}

module.exports = ({ whereaboutsApi }) => {
  const renderTemplate = (req, res, errors) => {
    const appointmentDetails = unpackAppointmentDetails(req)
    const {
      id,
      isRecurring,
      additionalDetails,
      basicDetails,
      prepostData,
      recurringDetails,
      timeDetails,
    } = appointmentDetails

    // Save for possible re-showing on error
    packAppointmentDetails(req, appointmentDetails)

    return res.render('appointmentConfirmDeletion', {
      errors,
      appointmentEventId: id,
      isRecurring,
      additionalDetails,
      basicDetails,
      prepostData,
      recurringDetails,
      timeDetails,
    })
  }

  const index = async (req, res) => {
    try {
      renderTemplate(req, res, [])
    } catch (error) {
      res.locals.redirectUrl = `/view-all-appointments`
      throw error
    }
  }

  const post = async (req, res) => {
    const { confirmation, isRecurring, appointmentEventId } = req.body

    if (!confirmation) {
      const errors = []
      errors.push({ text: 'Select yes if you want to delete this appointment', href: '#confirmation' })
      return renderTemplate(req, res, errors)
    }

    clearAppointmentDetails(req)

    if (confirmation === 'no') {
      return res.redirect(`/appointment-details/${appointmentEventId}`)
    }

    if (isRecurring === 'true') return res.redirect(`/appointment-details/recurring-appointments-booked`)

    try {
      await whereaboutsApi.deleteAppointment(res.locals, appointmentEventId)
      return res.redirect(`/appointment-details/deleted?multipleDeleted=false`)
    } catch (error) {
      res.locals.redirectUrl = `/appointment-details/${appointmentEventId}`
      throw error
    }
  }

  return { index, post }
}
