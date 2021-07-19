module.exports = ({ whereaboutsApi, appointmentDetailsService }) => {
  const renderTemplate = (req, res, id, appointmentViewModel, errors) => {
    const { isRecurring, additionalDetails, basicDetails, prepostData, recurringDetails, timeDetails } =
      appointmentViewModel

    return res.render('appointmentConfirmDeletion', {
      errors: req.flash('deletionErrors'),
      appointmentEventId: id,
      additionalDetails,
      basicDetails,
      prepostData,
      isRecurring,
      recurringDetails,
      timeDetails,
    })
  }

  const index = async (req, res) => {
    try {
      const { id } = req.params
      const { activeCaseLoadId } = req.session.userDetails

      const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

      const appointmentViewModel = await appointmentDetailsService.getAppointmentViewModel(
        res,
        appointmentDetails,
        activeCaseLoadId
      )

      renderTemplate(req, res, id, appointmentViewModel, [])
    } catch (error) {
      res.locals.redirectUrl = `/view-all-appointments`
      throw error
    }
  }

  const post = async (req, res) => {
    const { confirmation, isRecurring } = req.body
    const { id } = req.params

    if (!confirmation) {
      const errors = []
      errors.push({ text: 'Select yes if you want to delete this appointment', href: '#confirmation' })

      req.flash('deletionErrors', errors)
      return res.redirect(req.originalUrl)
    }

    if (confirmation === 'no') {
      return res.redirect(`/appointment-details/${id}`)
    }

    if (isRecurring === 'true') return res.redirect(`/appointment-details/${id}/delete-recurring-bookings`)

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

  return { index, post }
}
